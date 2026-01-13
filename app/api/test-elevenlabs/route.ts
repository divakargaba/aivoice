import { NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";

export async function GET() {
    try {
        const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
        
        if (!apiKey) {
            return NextResponse.json(
                { error: "ELEVENLABS_API_KEY not set" },
                { status: 500 }
            );
        }

        const client = new ElevenLabsClient({ apiKey });

        // Test 1: Get voices (this should work if API key is valid)
        console.log("🧪 Test 1: Fetching voices...");
        let voices;
        try {
            const voicesResponse = await client.voices.getAll();
            voices = voicesResponse.voices.slice(0, 3).map(v => ({
                id: v.voice_id,
                name: v.name,
            }));
            console.log("✅ Voices fetched successfully");
        } catch (error: any) {
            console.error("❌ Failed to fetch voices:", error?.statusCode, error?.message);
            return NextResponse.json({
                error: "Failed to fetch voices",
                details: {
                    statusCode: error?.statusCode,
                    message: error?.message,
                },
            }, { status: 500 });
        }

        // Test 2: Try generating a simple audio sample
        console.log("🧪 Test 2: Generating test audio...");
        let audioGenerated = false;
        let audioError = null;
        try {
            const testVoiceId = voices[0]?.id || "21m00Tcm4TlvDq8ikWAM"; // Default voice
            const audioStream = await client.generate({
                voice: testVoiceId,
                text: "Hello, this is a test.",
                model_id: "eleven_turbo_v2",
            });

            // Try to read the stream
            let chunkCount = 0;
            for await (const chunk of audioStream) {
                chunkCount++;
                if (chunkCount > 0) break; // Just verify we can read it
            }
            audioGenerated = true;
            console.log("✅ Audio generation test successful");
        } catch (error: any) {
            audioError = {
                statusCode: error?.statusCode,
                status: error?.status,
                message: error?.message,
                code: error?.code,
            };
            console.error("❌ Audio generation failed:", audioError);
        }

        return NextResponse.json({
            success: true,
            apiKeyValid: true,
            voicesFetched: voices.length,
            audioGenerationTest: {
                success: audioGenerated,
                error: audioError,
            },
            testVoice: voices[0],
        });
    } catch (error: any) {
        return NextResponse.json({
            error: "Test failed",
            details: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}

