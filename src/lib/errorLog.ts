import type { SupabaseClient } from "@supabase/supabase-js";

/** Something that went wrong, as saved to the Bug console on the Admin tab. */
export type ErrorReport = {
  source: "browser" | "server" | "form" | "test";
  message: string;
  details?: string | null;
  page?: string | null;
  digest?: string | null;
  userAgent?: string | null;
};

/** The message and the details worth keeping (stack, database code and hint) from anything thrown. */
export function describeError(error: unknown): { message: string; details: string | null; digest: string | null } {
  if (error instanceof Error) {
    const digest = "digest" in error && typeof error.digest === "string" ? error.digest : null;
    const parts = [error.stack ?? `${error.name}: ${error.message}`];
    if (error.cause) parts.push(`Caused by: ${describeError(error.cause).details ?? String(error.cause)}`);
    return { message: error.message || error.name, details: parts.join("\n"), digest };
  }
  if (error && typeof error === "object" && "message" in error) {
    // A Supabase/Postgres error: { message, code, details, hint }.
    const { message, ...rest } = error as { message: unknown };
    const extra = Object.entries(rest).filter(([, v]) => v != null && v !== "");
    return {
      message: String(message),
      details: extra.length ? extra.map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`).join("\n") : null,
      digest: null,
    };
  }
  return { message: String(error), details: null, digest: null };
}

/**
 * Saves the report and returns its error code (e.g. "E-7KQ3XM"), or null if it
 * couldn't be saved. Never throws: logging a problem mustn't cause another one.
 */
export async function logError(supabase: SupabaseClient, report: ErrorReport): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc("log_error", {
      p_source: report.source,
      p_message: report.message,
      p_details: report.details ?? null,
      p_page: report.page ?? null,
      // Next.js sometimes adds "@E123" to the digest it sends the browser.
      p_digest: report.digest?.split("@")[0] || null,
      p_user_agent: report.userAgent ?? null,
    });
    if (error) {
      console.error("Couldn't save to the bug console:", error.message);
      return null;
    }
    return (data as string | null) ?? null;
  } catch (e) {
    console.error("Couldn't save to the bug console:", e);
    return null;
  }
}
