"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { chapters, projects } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function verifyProjectOwnership(projectId: string, userId: string) {
    const project = await db.query.projects.findFirst({
        where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
    });

    if (!project) {
        throw new Error("Project not found or access denied");
    }

    return project;
}

export async function createChapter(
    projectId: string,
    title: string,
    rawText?: string
) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Verify project ownership
    await verifyProjectOwnership(projectId, userId);

    // Get the next index for this chapter
    const existingChapters = await db.query.chapters.findMany({
        where: eq(chapters.projectId, projectId),
        orderBy: [desc(chapters.idx)],
    });

    const nextIdx = existingChapters.length > 0 ? existingChapters[0].idx + 1 : 0;

    // Create the chapter
    const [chapter] = await db
        .insert(chapters)
        .values({
            projectId,
            title,
            rawText: rawText || null,
            idx: nextIdx,
        })
        .returning();

    revalidatePath(`/project/${projectId}`);
    return chapter;
}

export async function listChapters(projectId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Verify project ownership
    await verifyProjectOwnership(projectId, userId);

    const projectChapters = await db.query.chapters.findMany({
        where: eq(chapters.projectId, projectId),
        orderBy: (chapters, { asc }) => [asc(chapters.idx)],
        with: {
            textBlocks: {
                orderBy: (textBlocks, { asc }) => [asc(textBlocks.idx)],
            },
        },
    });

    return projectChapters;
}

export async function getChapter(chapterId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const chapter = await db.query.chapters.findFirst({
        where: eq(chapters.id, chapterId),
        with: {
            project: true,
            textBlocks: {
                orderBy: (textBlocks, { asc }) => [asc(textBlocks.idx)],
                with: {
                    speakerCharacter: true,
                    audioSegment: true,
                },
            },
        },
    });

    if (!chapter) {
        throw new Error("Chapter not found");
    }

    // Verify ownership through project
    if (chapter.project.userId !== userId) {
        throw new Error("Access denied");
    }

    return chapter;
}

export async function updateChapter(
    chapterId: string,
    data: { title?: string; rawText?: string }
) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const chapter = await db.query.chapters.findFirst({
        where: eq(chapters.id, chapterId),
        with: { project: true },
    });

    if (!chapter) {
        throw new Error("Chapter not found");
    }

    // Verify ownership
    if (chapter.project.userId !== userId) {
        throw new Error("Access denied");
    }

    const [updatedChapter] = await db
        .update(chapters)
        .set({
            ...(data.title !== undefined && { title: data.title }),
            ...(data.rawText !== undefined && { rawText: data.rawText }),
        })
        .where(eq(chapters.id, chapterId))
        .returning();

    revalidatePath(`/project/${chapter.projectId}`);
    return updatedChapter;
}

export async function deleteChapter(chapterId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const chapter = await db.query.chapters.findFirst({
        where: eq(chapters.id, chapterId),
        with: { project: true },
    });

    if (!chapter) {
        throw new Error("Chapter not found");
    }

    // Verify ownership
    if (chapter.project.userId !== userId) {
        throw new Error("Access denied");
    }

    await db.delete(chapters).where(eq(chapters.id, chapterId));

    revalidatePath(`/project/${chapter.projectId}`);
    return { success: true };
}

export async function reorderChapters(
    projectId: string,
    chapterIds: string[]
) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Verify project ownership
    await verifyProjectOwnership(projectId, userId);

    // Update each chapter's index
    const updates = chapterIds.map((id, index) =>
        db.update(chapters).set({ idx: index }).where(eq(chapters.id, id))
    );

    await Promise.all(updates);

    revalidatePath(`/project/${projectId}`);
    return { success: true };
}

