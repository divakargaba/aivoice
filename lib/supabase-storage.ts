import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is not set");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set");
}

// Use service role key for server-side operations
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            persistSession: false,
        },
    }
);

const AUDIO_BUCKET = "audio-segments";

export async function uploadAudio(
    projectId: string,
    chapterId: string,
    blockIdx: number,
    audioBuffer: Buffer
): Promise<string> {
    const fileName = `${projectId}/${chapterId}/block_${blockIdx}.mp3`;

    const { data, error } = await supabase.storage
        .from(AUDIO_BUCKET)
        .upload(fileName, audioBuffer, {
            contentType: "audio/mpeg",
            upsert: true,
        });

    if (error) {
        throw new Error(`Failed to upload audio: ${error.message}`);
    }

    // Get public URL
    const {
        data: { publicUrl },
    } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(fileName);

    return publicUrl;
}

export async function deleteAudio(audioUrl: string): Promise<void> {
    // Extract file path from URL
    const url = new URL(audioUrl);
    const filePath = url.pathname.split(`/${AUDIO_BUCKET}/`)[1];

    if (!filePath) {
        throw new Error("Invalid audio URL");
    }

    const { error } = await supabase.storage
        .from(AUDIO_BUCKET)
        .remove([filePath]);

    if (error) {
        console.error("Failed to delete audio:", error);
    }
}

export async function ensureBucketExists(): Promise<void> {
    const { data: buckets } = await supabase.storage.listBuckets();

    const bucketExists = buckets?.some((b) => b.name === AUDIO_BUCKET);

    if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(AUDIO_BUCKET, {
            public: true,
            fileSizeLimit: 10485760, // 10MB
        });

        if (error) {
            console.error("Failed to create bucket:", error);
        }
    }
}

