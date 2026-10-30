import { createClient } from "@supabase/supabase-js";

export const TIMETABLE_STORAGE_BUCKET = "timetable-verifications";

function getStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use service_role key for server operations if available, or anon key
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Uploads an uploaded timetable photo to a private Supabase Storage bucket.
 * The photo is never publicly reachable; only admins can generate temporary signed URLs.
 */
export async function uploadPrivateProofImage(
  imageBuffer: Buffer,
  mimeType: string = "image/jpeg"
): Promise<{ path: string } | null> {
  const supabase = getStorageClient();
  if (!supabase) return null;

  try {
    const filename = `proof-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;

    const { data, error } = await supabase.storage
      .from(TIMETABLE_STORAGE_BUCKET)
      .upload(filename, imageBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.warn("[Supabase Storage] Notice:", error.message);
      return null;
    }

    return { path: data.path };
  } catch (err: any) {
    console.warn("[Supabase Storage] Upload error:", err.message);
    return null;
  }
}

/**
 * Generates an expiring signed URL (valid for 1 hour) for authorized administrators.
 */
export async function createPrivateProofSignedUrl(
  path: string,
  expiresInSeconds: number = 3600
): Promise<string | null> {
  const supabase = getStorageClient();
  if (!supabase || !path) return null;

  try {
    const { data, error } = await supabase.storage
      .from(TIMETABLE_STORAGE_BUCKET)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data?.signedUrl) {
      console.warn("[Supabase Storage] Signed URL error:", error?.message);
      return null;
    }

    return data.signedUrl;
  } catch (err: any) {
    console.warn("[Supabase Storage] Error creating signed URL:", err.message);
    return null;
  }
}
