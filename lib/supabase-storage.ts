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
    // Ensure bucket exists first
    await ensureBucketExists();

    const fileName = `${projectId}/${chapterId}/block_${blockIdx}.mp3`;

    try {
        const { data, error } = await supabase.storage
            .from(AUDIO_BUCKET)
            .upload(fileName, audioBuffer, {
                contentType: "audio/mpeg",
                upsert: true,
            });

        if (error) {
            console.error("Supabase storage upload error:", {
                message: error.message,
                error: error,
            });
            throw new Error(`Failed to upload audio: ${error.message}`);
        }

        // Get public URL
        const {
            data: { publicUrl },
        } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(fileName);

        return publicUrl;
    } catch (error: any) {
        console.error("Upload audio error:", error);
        if (error.message?.includes("fetch failed")) {
            throw new Error(
                `Failed to upload audio: Network error. Check your Supabase configuration (NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY) and ensure the storage bucket exists.`
            );
        }
        throw error;
    }
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
    try {
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error("Failed to list buckets:", listError);
            // If we can't list buckets, assume it exists and try to use it
            // (the upload will fail with a better error if it doesn't)
            console.log(`⚠️  Could not verify bucket existence, proceeding anyway...`);
            return;
        }

        const bucketExists = buckets?.some((b) => b.name === AUDIO_BUCKET);

        if (!bucketExists) {
            console.log(`⚠️  Storage bucket '${AUDIO_BUCKET}' not found in list.`);
            console.log(`Available buckets:`, buckets?.map(b => b.name).join(", ") || "none");
            console.log(`Attempting to use bucket anyway (it may exist but not be accessible via API)...`);
            // Don't throw - let the upload attempt fail with a better error
            return;
        } else {
            console.log(`✅ Storage bucket '${AUDIO_BUCKET}' exists`);
        }
    } catch (error) {
        console.error("Error checking bucket existence:", error);
        // Don't throw - let the upload attempt fail with a better error
        console.log(`⚠️  Proceeding with upload attempt anyway...`);
    }
}

