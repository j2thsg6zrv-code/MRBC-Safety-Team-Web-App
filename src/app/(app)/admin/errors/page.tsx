import Link from "next/link";
import { CopyText } from "@/components/CopyText";
import { Status } from "@/components/Status";
import { Button, Card, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { ERROR_COLUMNS, entryAsText, SOURCE_LABELS, whoHadIt, type ErrorEntry } from "@/lib/bugConsole";
import { formatDateTime } from "@/lib/dates";
import { logError } from "@/lib/errorLog";
import { finish } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Bug console" };

const PATH = "/admin/errors";
const VIEWS = { open: "Not fixed", fixed: "Fixed", all: "All" } as const;
type View = keyof typeof VIEWS;

async function setFixed(formData: FormData) {
  "use server";
  await requireAdmin();
  const fixed = formData.get("fixed") === "yes";
  const supabase = await createClient();
  const { error } = await supabase
    .from("error_log")
    .update({ fixed_at: fixed ? new Date().toISOString() : null })
    .eq("id", Number(formData.get("id")));
  finish(PATH, error, fixed ? "Marked as fixed." : "Moved back to not fixed.");
}

async function deleteEntry(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("error_log").delete().eq("id", Number(formData.get("id")));
  finish(PATH, error, "Deleted.");
}

async function deleteFixed() {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("error_log").delete().not("fixed_at", "is", null);
  finish(PATH, error, "Deleted everything marked fixed.");
}

async function sendTest() {
  "use server";
  const user = await requireAdmin();
  const code = await logError(await createClient(), {
    source: "test",
    message: "Test entry from the Bug console",
    details: `Sent by ${user.fullName || user.email} to check that errors are being saved.`,
    page: PATH,
  });
  if (!code) finish(PATH, { message: "The test couldn't be saved. Has the bug console SQL update been run in Supabase?" });
  finish(PATH, null, `Test saved as ${code}. It's working.`);
}

function Entry({ entry }: { entry: ErrorEntry }) {
  return (
    <Card className="p-0">
      <details>
        <summary className="cursor-pointer list-none p-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-sm font-semibold">{entry.code}</span>
            <span className="text-xs text-slate-500">{SOURCE_LABELS[entry.source]}</span>
            {entry.fixed_at && <span className="rounded bg-green-50 px-1.5 text-xs font-medium text-green-700">Fixed</span>}
            {entry.occurrences > 1 && (
              <span className="rounded bg-amber-50 px-1.5 text-xs font-medium text-amber-800">{entry.occurrences} times</span>
            )}
          </div>
          <p className="mt-1 break-words font-medium">{entry.message}</p>
          <p className="mt-1 text-xs text-slate-500">
            {formatDateTime(entry.last_seen_at)} · {entry.page ?? "unknown page"} · {whoHadIt(entry)}
          </p>
        </summary>
        <div className="space-y-3 border-t border-slate-200 p-4 text-sm">
          <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[auto_1fr]">
            <dt className="text-slate-500">First seen</dt>
            <dd>{formatDateTime(entry.created_at)}</dd>
            <dt className="text-slate-500">Last seen</dt>
            <dd>{formatDateTime(entry.last_seen_at)}</dd>
            {entry.fixed_at && (
              <>
                <dt className="text-slate-500">Marked fixed</dt>
                <dd>{formatDateTime(entry.fixed_at)}</dd>
              </>
            )}
            {entry.user_agent && (
              <>
                <dt className="text-slate-500">Browser</dt>
                <dd className="break-words">{entry.user_agent}</dd>
              </>
            )}
          </dl>
          {entry.details && (
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-md bg-slate-100 p-3 font-mono text-xs">
              {entry.details}
            </pre>
          )}
          <form className="flex flex-wrap gap-2">
            <input type="hidden" name="id" value={entry.id} />
            <CopyText text={entryAsText(entry)} label="Copy details for fixing" />
            {entry.fixed_at ? (
              <Button type="submit" variant="secondary" formAction={setFixed} name="fixed" value="no">Not fixed yet</Button>
            ) : (
              <Button type="submit" formAction={setFixed} name="fixed" value="yes">Mark fixed</Button>
            )}
            <Button type="submit" variant="danger" formAction={deleteEntry}>Delete</Button>
          </form>
        </div>
      </details>
    </Card>
  );
}

export default async function BugConsolePage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string; saved?: string; error?: string }>;
}) {
  await requireAdmin();
  const { show } = await searchParams;
  const view: View = show && show in VIEWS ? (show as View) : "open";

  const supabase = await createClient();
  let query = supabase.from("error_log").select(ERROR_COLUMNS).order("last_seen_at", { ascending: false }).limit(200);
  if (view === "open") query = query.is("fixed_at", null);
  if (view === "fixed") query = query.not("fixed_at", "is", null);
  const { data, error } = await query;
  const entries = (data ?? []) as unknown as ErrorEntry[];

  return (
    <>
      <PageHeader title="Bug console">
        <Link href="/admin" className="text-sm text-blue-700 underline">Back to Admin</Link>
      </PageHeader>
      <Status searchParams={searchParams} />
      <p className="mb-4 text-sm text-slate-600">
        Whenever something goes wrong in the app (a page that crashes, a form that won&apos;t save), it&apos;s saved
        here with an error code, the page, who was using it, when, and technical details. Members see the code on the
        error screen, so they can tell you which one they hit. Tap an entry for details, then &ldquo;Copy details for
        fixing&rdquo; to send them to whoever is fixing it. Times are Central.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(Object.keys(VIEWS) as View[]).map((v) => (
          <Link
            key={v}
            href={v === "open" ? PATH : `${PATH}?show=${v}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              v === view ? "bg-blue-700 text-onaccent" : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
            }`}
          >
            {VIEWS[v]}
          </Link>
        ))}
        <form className="ml-auto flex flex-wrap gap-2">
          <Button type="submit" variant="secondary" formAction={sendTest}>Send a test</Button>
          {view !== "open" && (
            <Button type="submit" variant="danger" formAction={deleteFixed}>Delete all fixed</Button>
          )}
        </form>
      </div>

      {error ? (
        <Card>
          <p className="text-sm text-red-700">
            The bug console isn&apos;t set up in the database yet. Run the bug console SQL update in Supabase, then
            reload this page. ({error.message})
          </p>
        </Card>
      ) : entries.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">
            {view === "open" ? "Nothing's gone wrong. No errors waiting to be fixed." : "Nothing here."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Entry key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </>
  );
}
