"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
    projects,
    chapters,
    textBlocks,
    audioSegments,
    characters,
    voiceAssignments,
} from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateSpeech } from "@/lib/elevenlabs";
import { uploadAudio, ensureBucketExists } from "@/lib/supabase-storage";
import { retryWithBackoff } from "@/lib/retry-utils";

async function verifyProjectOwnership(projectId: string, userId: string) {
    const project = await db.query.projects.findFirst({
        where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
    });

    if (!project) {
        throw new Error("Project not found or access denied");
    }

    return project;
}

export async function generateAudioForChapter(
    projectId: string,
    chapterId: string
) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Verify project ownership
    await verifyProjectOwnership(projectId, userId);

    // Get the chapter with text blocks
    const chapter = await db.query.chapters.findFirst({
        where: eq(chapters.id, chapterId),
        with: {
            project: true,
            textBlocks: {
                orderBy: [asc(textBlocks.idx)],
                with: {
                    speakerCharacter: {
                        with: {
                            voiceAssignments: true,
                        },
                    },
                },
            },
        },
    });

    if (!chapter) {
        throw new Error("Chapter not found");
    }

    if (chapter.project.userId !== userId) {
        throw new Error("Access denied");
    }

    if (!chapter.textBlocks || chapter.textBlocks.length === 0) {
        throw new Error("No text blocks found. Run analysis first.");
    }

    // Get Narrator character and voice assignment
    const narratorChar = await db.query.characters.findFirst({
        where: and(
            eq(characters.projectId, projectId),
            eq(characters.name, "Narrator")
        ),
        with: {
            voiceAssignments: true,
        },
    });

    if (!narratorChar?.voiceAssignments[0]) {
        throw new Error(
            "Narrator voice not assigned. Please assign a voice to the Narrator in the Cast tab."
        );
    }

    const narratorVoice = narratorChar.voiceAssignments[0];

    // Ensure storage bucket exists
    await ensureBucketExists();

    const totalBlocks = chapter.textBlocks.length;

    // Update project status and initialize progress
    await db
        .update(projects)
        .set({
            status: "generating",
            generationProgress: {
                chapterId,
                current: 0,
                total: totalBlocks,
            },
        })
        .where(eq(projects.id, projectId));

    revalidatePath(`/project/${projectId}`);

    let successCount = 0;
    let errorCount = 0;

    try {
        // Process each text block
        for (const block of chapter.textBlocks) {
            try {
                // Determine which voice to use
                let voiceId: string;
                let provider: string;

                if (
                    block.kind === "dialogue" &&
                    block.speakerCharacter?.voiceAssignments[0]
                ) {
                    // Use character's assigned voice
                    const assignment = block.speakerCharacter.voiceAssignments[0];
                    provider = assignment.provider;
                    voiceId = assignment.voiceId;
                } else {
                    // Use narrator voice for narration or unassigned dialogue
                    provider = narratorVoice.provider;
                    voiceId = narratorVoice.voiceId;
                }

                // Skip if not ElevenLabs (for now, only supporting ElevenLabs)
                if (provider !== "elevenlabs") {
                    console.log(
                        `Skipping block ${block.idx}: Provider ${provider} not supported yet`
                    );
                    continue;
                }

                // Get director notes and emotion from meta
                const blockMeta = (block.meta as any) || {};
                const directorNotes = blockMeta.director_notes || undefined;
                const emotion = blockMeta.emotion || null;

                // Generate audio with retry logic, including emotion and director notes
                const audioBuffer = await retryWithBackoff(
                    () =>
                        generateSpeech({
                            text: block.text,
                            voiceId: voiceId,
                            emotion: emotion,
                            directorNotes: directorNotes,
                        }),
                    {
                        maxRetries: 3,
                        initialDelay: 2000,
                        maxDelay: 10000,
                    }
                );

                // Upload to Supabase Storage
                const audioUrl = await uploadAudio(
                    projectId,
                    chapterId,
                    block.idx,
                    audioBuffer
                );

                // Get audio duration (approximate based on text length and average speech rate)
                // Average speech rate: ~150 words per minute = ~2.5 words per second
                const wordCount = block.text.split(/\s+/).length;
                const estimatedDuration = Math.ceil((wordCount / 2.5) * 1000); // milliseconds

                // Check if audio segment already exists
                const existing = await db.query.audioSegments.findFirst({
                    where: eq(audioSegments.textBlockId, block.id),
                });

                if (existing) {
                    // Update existing
                    await db
                        .update(audioSegments)
                        .set({
                            provider,
                            voiceId,
                            audioUrl,
                            durationMs: estimatedDuration,
                        })
                        .where(eq(audioSegments.id, existing.id));
                } else {
                    // Insert new
                    await db.insert(audioSegments).values({
                        textBlockId: block.id,
                        provider,
                        voiceId,
                        audioUrl,
                        durationMs: estimatedDuration,
                    });
                }

                successCount++;

                // Update progress
                const currentProgress = successCount + errorCount;
                console.log(`Progress: ${currentProgress}/${totalBlocks} for chapter ${chapterId}`);

                await db
                    .update(projects)
                    .set({
                        generationProgress: {
                            chapterId,
                            current: currentProgress,
                            total: totalBlocks,
                        },
                    })
                    .where(eq(projects.id, projectId));

                revalidatePath(`/project/${projectId}`);

                // Small delay between requests to avoid rate limits
                await new Promise((resolve) => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`Failed to generate audio for block ${block.idx}:`, error);
                errorCount++;
                // Continue with next block instead of failing completely
            }
        }

        // Update project status to published if all succeeded and clear progress
        await db
            .update(projects)
            .set({
                status: errorCount === 0 ? "published" : "ready",
                generationProgress: null,
            })
            .where(eq(projects.id, projectId));

        revalidatePath(`/project/${projectId}`);

        return {
            success: true,
            successCount,
            errorCount,
            totalBlocks: chapter.textBlocks.length,
        };
    } catch (error) {
        // Set project back to ready on error and clear progress
        await db
            .update(projects)
            .set({
                status: "ready",
                generationProgress: null,
            })
            .where(eq(projects.id, projectId));

        revalidatePath(`/project/${projectId}`);

        throw error;
    }
}

export async function regenerateBlockAudio(
    projectId: string,
    textBlockId: string
) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Verify project ownership
    await verifyProjectOwnership(projectId, userId);

    // Get the text block with its speaker and chapter
    const block = await db.query.textBlocks.findFirst({
        where: eq(textBlocks.id, textBlockId),
        with: {
            chapter: {
                with: {
                    project: true,
                },
            },
            speakerCharacter: {
                with: {
                    voiceAssignments: true,
                },
            },
        },
    });

    if (!block) {
        throw new Error("Text block not found");
    }

    if (block.chapter.project.userId !== userId) {
        throw new Error("Access denied");
    }

    // Get Narrator voice as fallback
    const narratorChar = await db.query.characters.findFirst({
        where: and(
            eq(characters.projectId, projectId),
            eq(characters.name, "Narrator")
        ),
        with: {
            voiceAssignments: true,
        },
    });

    if (!narratorChar?.voiceAssignments[0]) {
        throw new Error(
            "Narrator voice not assigned. Please assign a voice to the Narrator in the Cast tab."
        );
    }

    const narratorVoice = narratorChar.voiceAssignments[0];

    // Ensure storage bucket exists
    await ensureBucketExists();

    // Determine which voice to use
    let voiceId: string;
    let provider: string;

    if (
        block.kind === "dialogue" &&
        block.speakerCharacter?.voiceAssignments[0]
    ) {
        // Use character's assigned voice
        const assignment = block.speakerCharacter.voiceAssignments[0];
        provider = assignment.provider;
        voiceId = assignment.voiceId;
    } else {
        // Use narrator voice for narration or unassigned dialogue
        provider = narratorVoice.provider;
        voiceId = narratorVoice.voiceId;
    }

    // Skip if not ElevenLabs
    if (provider !== "elevenlabs") {
        throw new Error(`Provider ${provider} not supported yet`);
    }

    // Get director notes and emotion from meta
    const blockMeta = (block.meta as any) || {};
    const directorNotes = blockMeta.director_notes || undefined;
    const emotion = blockMeta.emotion || null;

    // Generate audio with retry logic, including emotion and director notes
    const audioBuffer = await retryWithBackoff(
        () =>
            generateSpeech({
                text: block.text,
                voiceId: voiceId,
                emotion: emotion,
                directorNotes: directorNotes,
            }),
        {
            maxRetries: 3,
            initialDelay: 2000,
            maxDelay: 10000,
        }
    );

    // Upload to Supabase Storage
    const audioUrl = await uploadAudio(
        projectId,
        block.chapter.id,
        block.idx,
        audioBuffer
    );

    // Get audio duration estimate
    const wordCount = block.text.split(/\s+/).length;
    const estimatedDuration = Math.ceil((wordCount / 2.5) * 1000);

    // Check if audio segment already exists
    const existing = await db.query.audioSegments.findFirst({
        where: eq(audioSegments.textBlockId, textBlockId),
    });

    if (existing) {
        // Update existing
        await db
            .update(audioSegments)
            .set({
                provider,
                voiceId,
                audioUrl,
                durationMs: estimatedDuration,
            })
            .where(eq(audioSegments.id, existing.id));
    } else {
        // Insert new
        await db.insert(audioSegments).values({
            textBlockId,
            provider,
            voiceId,
            audioUrl,
            durationMs: estimatedDuration,
        });
    }

    revalidatePath(`/project/${projectId}`);

    return {
        success: true,
        audioUrl,
    };
}

export async function saveDirectorNotes(
    projectId: string,
    textBlockId: string,
    directorNotes: string
) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Verify project ownership
    await verifyProjectOwnership(projectId, userId);

    // Get the text block to verify it belongs to this project
    const block = await db.query.textBlocks.findFirst({
        where: eq(textBlocks.id, textBlockId),
        with: {
            chapter: {
                with: {
                    project: true,
                },
            },
        },
    });

    if (!block) {
        throw new Error("Text block not found");
    }

    if (block.chapter.project.userId !== userId) {
        throw new Error("Access denied");
    }

    // Update the meta field with director notes
    const currentMeta = block.meta || {};
    await db
        .update(textBlocks)
        .set({
            meta: {
                ...currentMeta,
                director_notes: directorNotes.trim() || undefined,
            },
        })
        .where(eq(textBlocks.id, textBlockId));

    revalidatePath(`/project/${projectId}`);

    return { success: true };
}

