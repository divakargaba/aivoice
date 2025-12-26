import { ElevenLabsClient } from "elevenlabs";

let elevenlabs: ElevenLabsClient | null = null;

function getElevenLabs(): ElevenLabsClient {
    if (!process.env.ELEVENLABS_API_KEY) {
        throw new Error("ELEVENLABS_API_KEY environment variable is not set");
    }
    if (!elevenlabs) {
        elevenlabs = new ElevenLabsClient({
            apiKey: process.env.ELEVENLABS_API_KEY,
        });
    }
    return elevenlabs;
}

export interface GenerateSpeechOptions {
    text: string;
    voiceId: string;
    modelId?: string;
    stability?: number;
    similarityBoost?: number;
    emotion?: string | null;
    directorNotes?: string;
}

/**
 * Prepare text with style guidance from emotion and director notes.
 * ElevenLabs interprets natural context, so we add guidance as a prefix
 * that will be processed but won't change the spoken words.
 * We use XML-style tags which ElevenLabs strips but uses for context.
 */
function prepareTextWithGuidance(
    text: string,
    emotion?: string | null,
    directorNotes?: string
): string {
    // ElevenLabs doesn't support explicit SSML, so we add natural context
    // as a prefix that helps the model understand the tone, then add a separator
    const guidance: string[] = [];

    // Add emotion guidance if present and not neutral
    if (emotion && emotion !== "neutral") {
        guidance.push(`Speaking with ${emotion} emotion:`);
    }

    // Add director notes if present
    if (directorNotes && directorNotes.trim()) {
        guidance.push(`Direction: ${directorNotes.trim()}.`);
    }

    // If we have guidance, we'll use it to adjust voice settings
    // but return the original text since ElevenLabs works best that way
    return text;
}

/**
 * Adjust voice settings based on emotion and director notes
 */
function adjustVoiceSettings(
    emotion?: string | null,
    directorNotes?: string
): { stability: number; similarityBoost: number; style?: number } {
    let stability = 0.5;
    let similarityBoost = 0.75;

    // Adjust stability based on emotion
    if (emotion) {
        switch (emotion.toLowerCase()) {
            case "excited":
            case "happy":
            case "angry":
                stability = 0.3; // More variable for high energy
                similarityBoost = 0.85;
                break;
            case "sad":
            case "whisper":
            case "calm":
                stability = 0.7; // More stable for subdued emotions
                similarityBoost = 0.65;
                break;
            case "tense":
            case "nervous":
                stability = 0.4;
                similarityBoost = 0.8;
                break;
        }
    }

    // Adjust based on director notes keywords
    if (directorNotes) {
        const notes = directorNotes.toLowerCase();
        if (notes.includes("slow") || notes.includes("calm") || notes.includes("steady")) {
            stability = Math.max(stability, 0.6);
        }
        if (notes.includes("fast") || notes.includes("excited") || notes.includes("energetic")) {
            stability = Math.min(stability, 0.4);
            similarityBoost = Math.max(similarityBoost, 0.8);
        }
        if (notes.includes("whisper") || notes.includes("quiet") || notes.includes("soft")) {
            stability = 0.75;
            similarityBoost = 0.6;
        }
        if (notes.includes("loud") || notes.includes("shout") || notes.includes("yell")) {
            stability = 0.3;
            similarityBoost = 0.9;
        }
        if (notes.includes("dramatic") || notes.includes("theatrical")) {
            stability = 0.35;
            similarityBoost = 0.85;
        }
        if (notes.includes("monotone") || notes.includes("flat") || notes.includes("boring")) {
            stability = 0.8;
            similarityBoost = 0.5;
        }
    }

    return { stability, similarityBoost };
}

export async function generateSpeech(
    options: GenerateSpeechOptions
): Promise<Buffer> {
    const {
        text,
        voiceId,
        modelId = "eleven_turbo_v2",
        stability = 0.5,
        similarityBoost = 0.75,
        emotion,
        directorNotes,
    } = options;

    try {
        const client = getElevenLabs();

        // Adjust voice settings based on emotion and director notes
        const voiceSettings = adjustVoiceSettings(emotion, directorNotes);

        console.log(
            `Generating speech - Text: "${text.substring(0, 50)}..." | Emotion: ${emotion || 'none'} | Notes: "${directorNotes || 'none'}" | Settings: stability=${voiceSettings.stability.toFixed(2)}, similarity=${voiceSettings.similarityBoost.toFixed(2)}`
        );

        const audio = await client.generate({
            voice: voiceId,
            text: text, // Use original text without prefix
            model_id: modelId,
            voice_settings: {
                stability: voiceSettings.stability,
                similarity_boost: voiceSettings.similarityBoost,
            },
        });

        // Convert audio stream to buffer
        const chunks: Uint8Array[] = [];
        for await (const chunk of audio) {
            chunks.push(chunk);
        }

        return Buffer.concat(chunks);
    } catch (error) {
        console.error("ElevenLabs API error:", error);
        throw new Error(
            `Failed to generate speech: ${error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
}

export async function getAvailableVoices() {
    try {
        const client = getElevenLabs();
        const voices = await client.voices.getAll();
        return voices.voices;
    } catch (error) {
        console.error("Failed to fetch ElevenLabs voices:", error);
        return [];
    }
}

