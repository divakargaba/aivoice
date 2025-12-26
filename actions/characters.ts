"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { projects, characters, voiceAssignments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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

export async function listCharacters(projectId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Verify project ownership
    await verifyProjectOwnership(projectId, userId);

    const projectCharacters = await db.query.characters.findMany({
        where: eq(characters.projectId, projectId),
        with: {
            voiceAssignments: true,
        },
        orderBy: (characters, { asc }) => [asc(characters.name)],
    });

    return projectCharacters;
}

export async function setVoiceAssignment(
    characterId: string,
    provider: string,
    voiceId: string,
    settings?: Record<string, any>
) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Get character and verify ownership through project
    const character = await db.query.characters.findFirst({
        where: eq(characters.id, characterId),
        with: { project: true },
    });

    if (!character) {
        throw new Error("Character not found");
    }

    if (character.project.userId !== userId) {
        throw new Error("Access denied");
    }

    // Check if voice assignment already exists
    const existing = await db.query.voiceAssignments.findFirst({
        where: eq(voiceAssignments.characterId, characterId),
    });

    if (existing) {
        // Update existing assignment
        const [updated] = await db
            .update(voiceAssignments)
            .set({
                provider,
                voiceId,
                settings: settings || null,
            })
            .where(eq(voiceAssignments.id, existing.id))
            .returning();

        revalidatePath(`/project/${character.projectId}`);
        return updated;
    } else {
        // Create new assignment
        const [created] = await db
            .insert(voiceAssignments)
            .values({
                characterId,
                provider,
                voiceId,
                settings: settings || null,
            })
            .returning();

        revalidatePath(`/project/${character.projectId}`);
        return created;
    }
}

export async function removeVoiceAssignment(characterId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Get character and verify ownership
    const character = await db.query.characters.findFirst({
        where: eq(characters.id, characterId),
        with: { project: true },
    });

    if (!character) {
        throw new Error("Character not found");
    }

    if (character.project.userId !== userId) {
        throw new Error("Access denied");
    }

    await db
        .delete(voiceAssignments)
        .where(eq(voiceAssignments.characterId, characterId));

    revalidatePath(`/project/${character.projectId}`);
    return { success: true };
}

