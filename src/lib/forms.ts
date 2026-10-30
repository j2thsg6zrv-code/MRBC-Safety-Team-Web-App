import { redirect } from "next/navigation";
import { after } from "next/server";
import { describeError, logError } from "@/lib/errorLog";
import { createClient } from "@/lib/supabase/server";

export type SearchParams = Promise<{ saved?: string; error?: string }>;

export function text(formData: FormData, name: string): string | null {
  const value = String(formData.get(name) ?? "").trim();
  return value === "" ? null : value;
}

/** Redirects back to `path`, reporting a database error or a saved message. */
export function finish(path: string, error: { message: string } | null, saved = "Saved."): never {
  // A database or storage error (it carries a code or status) goes to the Bug
  // console. A plain { message } is our own "please fix this field" note.
  if (error && Object.keys(error).some((key) => key !== "message")) {
    const { message, details } = describeError(error);
    try {
      after(async () =>
        logError(await createClient(), { source: "form", message, details: `Saving a form on ${path}\n${details ?? ""}`.trim(), page: path.split("?")[0] }),
      );
    } catch {
      // Not inside a request (shouldn't happen); still show the message.
    }
  }
  const params = new URLSearchParams(error ? { error: error.message } : { saved });
  redirect(`${path}?${params}`);
}
