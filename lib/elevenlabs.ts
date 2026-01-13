import { ElevenLabsClient } from "elevenlabs";

let elevenlabs: ElevenLabsClient | null = null;

function getElevenLabs(): ElevenLabsClient {
    if (!process.env.ELEVENLABS_API_KEY) {
        throw new Error("ELEVENLABS_API_KEY environment variable is not set");
    }
    // Always create a new client to ensure we use the latest API key
    // (in case it was updated in .env.local)
    const apiKey = process.env.ELEVENLABS_API_KEY.trim();

    // Debug logging (first 10 and last 10 chars only for security)
    console.log("🔑 Initializing ElevenLabs client with key:", {
        exists: !!apiKey,
        length: apiKey.length,
        prefix: apiKey.substring(0, 10),
        suffix: apiKey.substring(apiKey.length - 10),
    });

    elevenlabs = new ElevenLabsClient({
        apiKey: apiKey,
    });
    return elevenlabs;
}

export interface GenerateSpeechOptions {
    text: string;
    voiceId: string;
    modelId?: string;
    stability?: number;
    similarityBoost?: number;
    style?: number;
    emotion?: string | null;
    directorNotes?: string;
}

export interface VoiceSettings {
    stability: number;
    similarityBoost: number;
    style: number;
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
 * EXTREME VERSION - Makes dramatic, obvious changes!
 */
function adjustVoiceSettings(
    emotion?: string | null,
    directorNotes?: string
): VoiceSettings {
    let stability = 0.5;
    let similarityBoost = 0.75;
    let style = 0.5;

    // Start with emotion-based adjustments (more extreme!)
    if (emotion) {
        switch (emotion.toLowerCase()) {
            case "excited":
            case "happy":
                stability = 0.2; // VERY expressive
                similarityBoost = 0.85;
                style = 0.8; // High expressiveness
                break;
            case "angry":
                stability = 0.15; // MAXIMUM variability
                similarityBoost = 0.95; // VERY strong
                style = 0.9; // Highly expressive
                break;
            case "sad":
                stability = 0.75; // Very controlled
                similarityBoost = 0.6;
                style = 0.3; // Subdued
                break;
            case "whisper":
            case "calm":
                stability = 0.8; // Very stable
                similarityBoost = 0.5;
                style = 0.2; // Minimal expression
                break;
            case "tense":
            case "nervous":
                stability = 0.3;
                similarityBoost = 0.8;
                style = 0.6;
                break;
            case "shout":
                stability = 0.1; // EXTREME variability
                similarityBoost = 0.95;
                style = 1.0; // MAXIMUM expression
                break;
        }
    }

    // Director notes override and amplify (EXTREME ranges!)
    if (directorNotes) {
        const notes = directorNotes.toLowerCase();

        // Check for intensity modifiers
        const hasVery = notes.includes("very") || notes.includes("extremely") || notes.includes("incredibly");
        const intensityMultiplier = hasVery ? 1.5 : 1.0;

        // WHISPER - Make it ACTUALLY whisper
        if (notes.includes("whisper") || (notes.includes("quiet") && notes.includes("soft"))) {
            stability = 0.95; // Almost monotone
            similarityBoost = 0.3; // Very soft
            style = 0.0; // Zero expressiveness
        }

        // SHOUT - Make it ACTUALLY shout
        if (notes.includes("shout") || notes.includes("yell") || notes.includes("scream")) {
            stability = 0.05; // EXTREME variability
            similarityBoost = 0.98; // Maximum strength
            style = 1.0; // Maximum expressiveness
        }

        // LOUD - Strong but controlled
        if (notes.includes("loud") && !notes.includes("shout")) {
            stability = 0.3;
            similarityBoost = 0.9;
            style = 0.75;
        }

        // QUIET/SOFT - Gentle
        if ((notes.includes("quiet") || notes.includes("soft")) && !notes.includes("whisper")) {
            stability = 0.7;
            similarityBoost = 0.5;
            style = 0.3;
        }

        // SLOW/CALM - Controlled and steady
        if (notes.includes("slow") || notes.includes("calm") || notes.includes("steady")) {
            stability = Math.min(0.85, stability + 0.3);
            style = Math.max(0.2, style - 0.2);
        }

        // FAST/EXCITED - Energetic
        if (notes.includes("fast") || notes.includes("rapid") || notes.includes("rushed")) {
            stability = Math.max(0.15, stability - 0.3);
            similarityBoost = Math.min(0.9, similarityBoost + 0.15);
            style = Math.min(0.9, style + 0.3);
        }

        // DRAMATIC/THEATRICAL - High expression
        if (notes.includes("dramatic") || notes.includes("theatrical") || notes.includes("expressive")) {
            stability = 0.2;
            similarityBoost = 0.85;
            style = 0.95; // Almost maximum
        }

        // MONOTONE/FLAT - Zero expression
        if (notes.includes("monotone") || notes.includes("flat") || notes.includes("boring") || notes.includes("robotic")) {
            stability = 0.95; // Maximum stability
            similarityBoost = 0.4;
            style = 0.0; // Zero expression
        }

        // NERVOUS/HESITANT - Shaky
        if (notes.includes("nervous") || notes.includes("hesitant") || notes.includes("uncertain")) {
            stability = 0.25;
            similarityBoost = 0.7;
            style = 0.5;
        }

        // CONFIDENT/STRONG - Assertive
        if (notes.includes("confident") || notes.includes("strong") || notes.includes("assertive")) {
            stability = 0.4;
            similarityBoost = 0.88;
            style = 0.7;
        }

        // EMOTIONAL/CRYING - Very expressive
        if (notes.includes("crying") || notes.includes("emotional") || notes.includes("tearful")) {
            stability = 0.2;
            similarityBoost = 0.75;
            style = 0.85;
        }

        // Apply intensity multiplier
        if (hasVery) {
            // Push values more extreme
            if (stability < 0.5) stability = Math.max(0.0, stability - 0.1);
            if (stability > 0.5) stability = Math.min(1.0, stability + 0.1);
            if (style < 0.5) style = Math.max(0.0, style - 0.1);
            if (style > 0.5) style = Math.min(1.0, style + 0.15);
        }
    }

    // Clamp values to valid range
    return {
        stability: Math.max(0.0, Math.min(1.0, stability)),
        similarityBoost: Math.max(0.0, Math.min(1.0, similarityBoost)),
        style: Math.max(0.0, Math.min(1.0, style))
    };
}

/**
 * Export for use in UI to show calculated settings
 */
export function calculateVoiceSettings(
    emotion?: string | null,
    directorNotes?: string
): VoiceSettings {
    return adjustVoiceSettings(emotion, directorNotes);
}

export async function generateSpeech(
    options: GenerateSpeechOptions
): Promise<Buffer> {
    const {
        text,
        voiceId,
        modelId = "eleven_turbo_v2",
        emotion,
        directorNotes,
    } = options;

    try {
        const client = getElevenLabs();

        // Calculate EXTREME voice settings
        const voiceSettings = adjustVoiceSettings(emotion, directorNotes);

        console.log(
            `🎤 Generating speech - Text: "${text.substring(0, 50)}..."`
        );
        console.log(
            `   Emotion: ${emotion || 'none'} | Notes: "${directorNotes || 'none'}"`
        );
        console.log(
            `   ⚡ SETTINGS: Stability=${voiceSettings.stability.toFixed(2)} | Similarity=${voiceSettings.similarityBoost.toFixed(2)} | Style=${voiceSettings.style.toFixed(2)}`
        );

        console.log(`📤 Making API call with:`, {
            voice: voiceId,
            model_id: modelId,
            text_length: text.length,
            voice_settings: voiceSettings,
        });

        const audio = await client.generate({
            voice: voiceId,
            text: text,
            model_id: modelId,
            voice_settings: {
                stability: voiceSettings.stability,
                similarity_boost: voiceSettings.similarityBoost,
                style: voiceSettings.style,
                use_speaker_boost: true, // Better voice clarity
            },
        });

        // Convert audio stream to buffer
        const chunks: Uint8Array[] = [];
        for await (const chunk of audio) {
            chunks.push(chunk);
        }

        return Buffer.concat(chunks);
    } catch (error: any) {
        console.error("❌ ElevenLabs API error details:", {
            message: error?.message,
            statusCode: error?.statusCode,
            status: error?.status,
            code: error?.code,
            response: error?.response ? "Response object present" : "No response",
            body: error?.body ? "Body present" : "No body",
        });

        // Log full error for debugging
        if (error?.response) {
            try {
                const errorText = await error.response.text();
                console.error("Error response body:", errorText);
            } catch (e) {
                console.error("Could not read error response body");
            }
        }

        // Provide more helpful error messages
        if (error?.statusCode === 401 || error?.status === 401) {
            throw new Error(
                "Authentication failed (401). The API key may be invalid, expired, or your account may have restrictions. Check your ElevenLabs dashboard for account status."
            );
        }

        throw new Error(
            `Failed to generate speech: ${error instanceof Error ? error.message : JSON.stringify(error)}`
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

