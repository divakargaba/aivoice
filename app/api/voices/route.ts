import { NextResponse } from "next/server";
import { getAvailableVoices } from "@/lib/elevenlabs";

export async function GET() {
    try {
        const voices = await getAvailableVoices();
        return NextResponse.json({ voices });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to load voices" },
            { status: 500 }
        );
    }
}
