import { formatDateTime } from "@/lib/dates";

export type ErrorEntry = {
  id: number;
  code: string;
  source: "browser" | "server" | "form" | "test";
  message: string;
  details: string | null;
  digest: string | null;
  page: string | null;
  user_agent: string | null;
  occurrences: number;
  created_at: string;
  last_seen_at: string;
  fixed_at: string | null;
  profiles: { full_name: string | null; email: string } | null;
};

export const ERROR_COLUMNS =
  "id, code, source, message, details, digest, page, user_agent, occurrences, created_at, last_seen_at, fixed_at, profiles(full_name, email)";

export const SOURCE_LABELS: Record<ErrorEntry["source"], string> = {
  browser: "In the browser",
  server: "On the server",
  form: "Saving a form",
  test: "Test",
};

export function whoHadIt(entry: ErrorEntry): string {
  return entry.profiles ? entry.profiles.full_name || entry.profiles.email : "Not signed in";
}

/** Everything about an entry as plain text, to paste into a message to whoever is fixing it. */
export function entryAsText(entry: ErrorEntry): string {
  return [
    `Error code: ${entry.code}`,
    `What happened: ${entry.message}`,
    `Where: ${SOURCE_LABELS[entry.source]}, page ${entry.page ?? "unknown"}`,
    `Who: ${whoHadIt(entry)}`,
    `First seen: ${formatDateTime(entry.created_at)} (Central)`,
    `Last seen: ${formatDateTime(entry.last_seen_at)} (Central), ${entry.occurrences} time${entry.occurrences === 1 ? "" : "s"}`,
    entry.user_agent && `Browser: ${entry.user_agent}`,
    entry.digest && `Digest: ${entry.digest}`,
    entry.details && `Details:\n${entry.details}`,
  ]
    .filter(Boolean)
    .join("\n");
}
