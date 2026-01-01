import { NextRequest, NextResponse } from "next/server";
import { generateSpeech } from "@/lib/elevenlabs";

const MAX_PREVIEW_TEXT_LENGTH = 400;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const voiceId = body?.voiceId as string | undefined;
        const text = body?.text as string | undefined;

        if (!voiceId) {
            return NextResponse.json(
                { error: "voiceId is required" },
                { status: 400 }
            );
        }

        const previewText = (text || "").trim();
        if (!previewText) {
            return NextResponse.json(
                { error: "text is required" },
                { status: 400 }
            );
        }

        const audioBuffer = await generateSpeech({
            voiceId,
            text: previewText.slice(0, MAX_PREVIEW_TEXT_LENGTH),
        });

        return new NextResponse(audioBuffer, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to generate preview",
            },
            { status: 500 }
        );
    }
}
