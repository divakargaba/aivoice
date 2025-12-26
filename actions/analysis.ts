"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { projects, chapters, characters, textBlocks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getOpenAI } from "@/lib/openai";
import {
    analysisResultSchema,
    type AnalysisResult,
} from "@/lib/analysis-schema";
import {
    ANALYSIS_SYSTEM_PROMPT,
    createAnalysisPrompt,
} from "@/lib/analysis-prompt";

async function verifyProjectOwnership(projectId: string, userId: string) {
    const project = await db.query.projects.findFirst({
        where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
    });

    if (!project) {
        throw new Error("Project not found or access denied");
    }

    return project;
}

export async function runAnalysis(projectId: string, chapterId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Verify project ownership
    await verifyProjectOwnership(projectId, userId);

    // Get the chapter
    const chapter = await db.query.chapters.findFirst({
        where: eq(chapters.id, chapterId),
        with: { project: true },
    });

    if (!chapter) {
        throw new Error("Chapter not found");
    }

    if (chapter.project.userId !== userId) {
        throw new Error("Access denied");
    }

    if (!chapter.rawText) {
        throw new Error("Chapter has no content to analyze");
    }

    // Update project status to analyzing
    await db
        .update(projects)
        .set({ status: "analyzing" })
        .where(eq(projects.id, projectId));

    revalidatePath(`/project/${projectId}`);

    try {
        // Call OpenAI to analyze the text using fetch directly
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            throw new Error("OPENAI_API_KEY not set");
        }

        console.log("🔑 Making request with key:", apiKey.substring(0, 20) + "..." + apiKey.substring(apiKey.length - 10));

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: ANALYSIS_SYSTEM_PROMPT,
                    },
                    {
                        role: "user",
                        content: createAnalysisPrompt(chapter.rawText),
                    },
                ],
                temperature: 0.3,
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("OpenAI API error:", error);
            throw new Error(`OpenAI API error: ${response.status} - ${error}`);
        }

        const completion = await response.json();
        const responseText = completion.choices[0]?.message?.content;

        if (!responseText) {
            throw new Error("No response from AI");
        }

        // Parse and validate the JSON response
        let analysisResult: AnalysisResult;
        try {
            const parsed = JSON.parse(responseText);
            analysisResult = analysisResultSchema.parse(parsed);
        } catch (error) {
            console.error("Failed to parse AI response:", responseText);
            throw new Error("Invalid AI response format");
        }

        // Upsert characters
        const characterMap = new Map<string, string>(); // name -> id

        // First, ensure Narrator character exists
        const narratorChar = await db.query.characters.findFirst({
            where: and(
                eq(characters.projectId, projectId),
                eq(characters.name, "Narrator")
            ),
        });

        if (!narratorChar) {
            await db.insert(characters).values({
                projectId,
                name: "Narrator",
                description: "Default narrator voice for narration blocks",
            });
        }

        // Then process detected characters
        for (const char of analysisResult.characters) {
            // Check if character already exists
            const existing = await db.query.characters.findFirst({
                where: and(
                    eq(characters.projectId, projectId),
                    eq(characters.name, char.name)
                ),
            });

            if (existing) {
                characterMap.set(char.name, existing.id);
                // Update description if provided
                if (char.description) {
                    await db
                        .update(characters)
                        .set({ description: char.description })
                        .where(eq(characters.id, existing.id));
                }
            } else {
                // Create new character
                const [newChar] = await db
                    .insert(characters)
                    .values({
                        projectId,
                        name: char.name,
                        description: char.description || null,
                    })
                    .returning();
                characterMap.set(char.name, newChar.id);
            }
        }

        // Delete existing text blocks for this chapter (for re-analysis)
        await db.delete(textBlocks).where(eq(textBlocks.chapterId, chapterId));

        // Create text blocks
        for (const block of analysisResult.blocks) {
            let speakerCharacterId: string | null = null;

            // Match speaker to character (if not Narrator)
            if (block.speaker !== "Narrator" && block.kind === "dialogue") {
                speakerCharacterId = characterMap.get(block.speaker) || null;
            }

            await db.insert(textBlocks).values({
                chapterId,
                idx: block.idx,
                kind: block.kind,
                speakerCharacterId,
                text: block.text,
                meta: {
                    emotion: block.emotion || "neutral",
                },
            });
        }

        // Update project status to ready
        await db
            .update(projects)
            .set({ status: "ready" })
            .where(eq(projects.id, projectId));

        revalidatePath(`/project/${projectId}`);

        return {
            success: true,
            charactersFound: analysisResult.characters.length,
            blocksCreated: analysisResult.blocks.length,
        };
    } catch (error) {
        // Set project back to draft on error
        await db
            .update(projects)
            .set({ status: "draft" })
            .where(eq(projects.id, projectId));

        revalidatePath(`/project/${projectId}`);

        console.error("Analysis failed:", error);
        throw error;
    }
}

