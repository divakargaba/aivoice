"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { projects, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createProject(title: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Ensure user exists in our database (sync from Clerk)
    const existingUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (!existingUser) {
        // Create user if they don't exist (first time)
        const clerkUser = await auth();
        await db.insert(users).values({
            id: userId,
            email: clerkUser.sessionClaims?.email as string || "",
        });
    }

    // Create the project
    const [project] = await db
        .insert(projects)
        .values({
            userId,
            title,
            status: "draft",
        })
        .returning();

    revalidatePath("/dashboard");
    return project;
}

export async function listProjects() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const userProjects = await db.query.projects.findMany({
        where: eq(projects.userId, userId),
        orderBy: [desc(projects.createdAt)],
        with: {
            chapters: {
                orderBy: (chapters, { asc }) => [asc(chapters.idx)],
            },
            characters: true,
        },
    });

    return userProjects;
}

export async function getProject(projectId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const project = await db.query.projects.findFirst({
        where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
        with: {
            chapters: {
                orderBy: (chapters, { asc }) => [asc(chapters.idx)],
            },
            characters: {
                with: {
                    voiceAssignments: true,
                },
            },
        },
    });

    if (!project) {
        throw new Error("Project not found or access denied");
    }

    return project;
}

export async function updateProjectStatus(
    projectId: string,
    status: "draft" | "analyzing" | "ready" | "generating" | "published"
) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Verify ownership
    const project = await db.query.projects.findFirst({
        where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
    });

    if (!project) {
        throw new Error("Project not found or access denied");
    }

    const [updatedProject] = await db
        .update(projects)
        .set({ status })
        .where(eq(projects.id, projectId))
        .returning();

    revalidatePath("/dashboard");
    revalidatePath(`/project/${projectId}`);
    return updatedProject;
}

export async function deleteProject(projectId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Verify ownership
    const project = await db.query.projects.findFirst({
        where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
    });

    if (!project) {
        throw new Error("Project not found or access denied");
    }

    await db.delete(projects).where(eq(projects.id, projectId));

    revalidatePath("/dashboard");
    return { success: true };
}

