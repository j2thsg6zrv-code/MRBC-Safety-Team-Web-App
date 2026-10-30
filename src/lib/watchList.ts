import type { SupabaseClient } from "@supabase/supabase-js";

export const BUCKET = "watch-list";

export type WatchListEntry = {
  id: string;
  full_name: string;
  aliases: string | null;
  status: "watch" | "banned";
  description: string | null;
  reason: string | null;
  vehicle: string | null;
  instructions: string | null;
  banned_until: string | null;
  photo_path: string | null;
  archived: boolean;
  created_at: string;
  profiles?: { full_name: string } | null;
};

export type WatchListNote = {
  id: string;
  entry_id: string;
  body: string;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
  author: { full_name: string } | null;
  editor: { full_name: string } | null;
};

export const STATUS_LABELS = {
  watch: { label: "Watch for", className: "bg-amber-100 text-amber-900" },
  banned: { label: "Not allowed on property", className: "bg-red-100 text-red-800" },
} as const;

/** Short-lived links for private photos, keyed by storage path. */
export async function photoUrls(supabase: SupabaseClient, paths: (string | null)[]): Promise<Record<string, string>> {
  const wanted = paths.filter((p): p is string => !!p);
  if (wanted.length === 0) return {};
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(wanted, 60 * 60);
  const urls: Record<string, string> = {};
  for (const d of data ?? []) if (d.path && d.signedUrl) urls[d.path] = d.signedUrl;
  return urls;
}

/** Uploads the photo in the form, if one was chosen, and returns its path. */
export async function uploadPhoto(supabase: SupabaseClient, formData: FormData) {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { path: null, error: null };
  if (!file.type.startsWith("image/")) return { path: null, error: { message: "The photo must be an image file." } };
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  return { path: error ? null : path, error };
}
