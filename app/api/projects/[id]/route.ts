import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/actions/projects";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const project = await getProject(id);
        return NextResponse.json(project);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Project not found" },
            { status: 404 }
        );
    }
}

