import { redirect } from "next/navigation";

export type SearchParams = Promise<{ saved?: string; error?: string }>;

export function text(formData: FormData, name: string): string | null {
  const value = String(formData.get(name) ?? "").trim();
  return value === "" ? null : value;
}

/** Redirects back to `path`, reporting a database error or a saved message. */
export function finish(path: string, error: { message: string } | null, saved = "Saved."): never {
  const params = new URLSearchParams(error ? { error: error.message } : { saved });
  redirect(`${path}?${params}`);
}
