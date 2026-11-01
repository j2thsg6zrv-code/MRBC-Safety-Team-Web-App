import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Status } from "@/components/Status";
import { Button, Card, Field, PageHeader, Select, TextArea } from "@/components/ui";
import { getCurrentUser, requirePermission } from "@/lib/auth";
import { formatDateTime } from "@/lib/dates";
import { finish, text } from "@/lib/forms";
import { THREAT_LEVELS, cleanSourceUrl, type IntelReport, type ThreatLevel } from "@/lib/intel";
import { createClient } from "@/lib/supabase/server";

/** Reads and checks the form; returns a message for the first thing to fix. */
type FormResult =
  | { problem: string }
  | { problem?: never; values: { title: string; description: string; source_url: string | null; threat_level: ThreatLevel } };

function readForm(formData: FormData): FormResult {
  const title = text(formData, "title");
  const description = text(formData, "description");
  const level = String(formData.get("threat_level")) as ThreatLevel;
  const source_url = cleanSourceUrl(text(formData, "source_url"));
  if (!title || title.length < 3) return { problem: "Give the report a title." };
  if (!description) return { problem: "Add a description." };
  if (!(level in THREAT_LEVELS)) return { problem: "Choose a threat level." };
  if (source_url === undefined) return { problem: "The source link doesn't look like a web address." };
  return { values: { title, description, source_url, threat_level: level } };
}

async function save(formData: FormData) {
  "use server";
  const user = await requirePermission("manage_intel");
  const form = readForm(formData);
  if (form.problem !== undefined) finish("/intel", { message: form.problem });
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const { error } = id
    ? await supabase.from("intel_reports").update({ ...form.values, updated_at: new Date().toISOString() }).eq("id", id)
    : await supabase.from("intel_reports").insert({ ...form.values, created_by: user.id });
  revalidatePath("/intel");
  finish("/intel", error, id ? "Report updated." : "Report posted.");
}

async function remove(formData: FormData) {
  "use server";
  await requirePermission("manage_intel");
  const supabase = await createClient();
  const { error } = await supabase.from("intel_reports").delete().eq("id", String(formData.get("id")));
  revalidatePath("/intel");
  finish("/intel", error, "Report removed.");
}

function ReportFields({ report }: { report?: IntelReport }) {
  return (
    <>
      {report && <input type="hidden" name="id" value={report.id} />}
      <Field label="Title" name="title" required minLength={3} maxLength={200} defaultValue={report?.title} placeholder="e.g. Threats made against area churches" />
      <TextArea
        label="Description"
        name="description"
        required
        rows={5}
        maxLength={10000}
        defaultValue={report?.description}
        placeholder="What's going on, where, and what the team should watch for."
      />
      <Field
        label="Link to the source (optional)"
        name="source_url"
        type="text"
        inputMode="url"
        maxLength={2000}
        defaultValue={report?.source_url ?? ""}
        placeholder="https://"
      />
      <div className="w-48">
        <Select label="Threat level" name="threat_level" required defaultValue={report?.threat_level ?? ""}>
          <option value="" disabled>Choose…</option>
          {Object.entries(THREAT_LEVELS).map(([key, level]) => (
            <option key={key} value={key}>{level.label}</option>
          ))}
        </Select>
      </div>
    </>
  );
}

function Report({ report, canManage }: { report: IntelReport; canManage: boolean }) {
  const level = THREAT_LEVELS[report.threat_level];
  const edited = new Date(report.updated_at).getTime() - new Date(report.created_at).getTime() > 60_000;
  return (
    <li className="space-y-2 px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold">{report.title}</p>
          <p className="text-sm text-slate-500">
            {report.profiles ? report.profiles.full_name : "Former member"} · {formatDateTime(report.created_at)}
            {edited && " · edited"}
          </p>
        </div>
        <span className={`shrink-0 rounded border px-2 py-0.5 text-xs font-semibold uppercase ${level.className}`}>
          {level.label} threat
        </span>
      </div>
      <p className="whitespace-pre-wrap text-sm text-slate-700">{report.description}</p>
      {report.source_url && (
        <p className="text-sm">
          <a href={report.source_url} target="_blank" rel="noopener noreferrer" className="break-all text-blue-700 underline">
            Source: {report.source_url.replace(/^https?:\/\//i, "").replace(/\/$/, "")}
          </a>
        </p>
      )}
      {canManage && (
        <details className="pt-1">
          <summary className="cursor-pointer text-sm text-blue-700 underline">Edit</summary>
          <form action={save} className="mt-3 space-y-3">
            <ReportFields report={report} />
            <div className="flex gap-2">
              <Button type="submit" pendingLabel="Saving…">Save changes</Button>
            </div>
          </form>
          <form action={remove} className="mt-3">
            <input type="hidden" name="id" value={report.id} />
            <Button type="submit" variant="danger">Delete report</Button>
          </form>
        </details>
      )}
    </li>
  );
}

export default async function IntelPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; saved?: string; error?: string }>;
}) {
  const { level = "all" } = await searchParams;
  const user = await getCurrentUser();
  const canManage = user.can("manage_intel");
  const supabase = await createClient();

  let query = supabase
    .from("intel_reports")
    .select("*, profiles:created_by(full_name)")
    .order("created_at", { ascending: false })
    .limit(300);
  if (level in THREAT_LEVELS) query = query.eq("threat_level", level);
  const { data } = await query;
  const reports = (data ?? []) as unknown as IntelReport[];

  const filter = (value: string, label: string) => (
    <Link
      key={value}
      href={value === "all" ? "/intel" : `/intel?level=${value}`}
      className={`rounded-full px-3 py-1 text-sm ${level === value ? "bg-slate-800 text-white" : "bg-white text-slate-700 hover:bg-slate-200"}`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <PageHeader title="Intel" />
      <Status searchParams={searchParams} />
      {canManage && (
        <Card className="mb-6">
          <h2 className="mb-1 font-semibold">New intel report</h2>
          <p className="mb-3 text-sm text-slate-600">The whole safety team sees reports on this page.</p>
          <form action={save} className="space-y-3">
            <ReportFields />
            <Button type="submit" pendingLabel="Saving…">Save report</Button>
          </form>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {filter("all", "All")}
        {Object.entries(THREAT_LEVELS).map(([key, l]) => filter(key, l.label))}
      </div>
      {reports.length === 0 ? (
        <Card><p className="text-slate-600">No intel reports {level in THREAT_LEVELS ? "at this level " : ""}yet.</p></Card>
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-slate-100">
            {reports.map((r) => <Report key={r.id} report={r} canManage={canManage} />)}
          </ul>
        </Card>
      )}
    </>
  );
}
