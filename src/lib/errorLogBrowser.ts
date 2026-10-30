import { createClient } from "@/lib/supabase/client";
import { describeError, logError } from "@/lib/errorLog";

let sent = 0;
const seen = new Set<string>();

/** Saves something that went wrong in the browser to the Bug console. Returns its error code. */
export async function reportBrowserError(error: unknown, extra?: string): Promise<string | null> {
  const { message, details, digest } = describeError(error);
  // A loop that keeps failing would otherwise send hundreds of copies.
  const key = `${message}|${digest}`;
  if (seen.has(key) || sent >= 10) return null;
  seen.add(key);
  sent++;
  return logError(createClient(), {
    source: "browser",
    message,
    details: [extra, details].filter(Boolean).join("\n") || null,
    page: window.location.pathname,
    digest,
    userAgent: navigator.userAgent,
  });
}
