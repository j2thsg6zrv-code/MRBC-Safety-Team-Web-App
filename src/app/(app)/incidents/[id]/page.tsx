import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { IncidentForm, readIncidentForm, SEVERITIES, type IncidentValues } from "@/components/IncidentForm";
import { Status } from "@/components/Status";
import { Button, Card, PageHeader, TextArea } from "@/components/ui";
import { getCurrentUser, requirePermission } from "@/lib/auth";
import { formatDate, formatTime, localDate } from "@/lib/dates";
import { finish, text, type SearchParams } from "@/lib/forms";
import { incidentFormOptions } from "@/lib/incidents";
import { createClient } from "@/lib/supabase/server";

type Incident = IncidentValues & {
  status: "open" | "closed";
  follow_up_notes: string | null;
  reported_by: string | null;
  created_at: string;
  buildings: { name: string } | null;
  events: { title: string; event_date: string } | null;
  watch_list: { id: string; full_name: string } | null;
  profiles: { full_name: string; email: string } | null;
};

async function updateReport(formData: FormData) {
  "use server";
  await getCurrentUser();
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.from("incident_reports").update(readIncidentForm(formData)).eq("id", id);
  finish(`/incidents/${id}`, error);
}

async function updateFollowUp(formData: FormData) {
  "use server";
  await requirePermission("manage_incidents");
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase
    .from("incident_reports")
    .update({ follow_up_notes: text(formData, "follow_up_notes"), status: formData.get("status") === "closed" ? "closed" : "open" })
    .eq("id", id);
  finish(`/incidents/${id}`, error);
}

async function deleteReport(formData: FormData) {
  "use server";
  await requirePermission("manage_incidents");
  const supabase = await createClient();
  const { error } = await supabase.from("incident_reports").delete().eq("id", String(formData.get("id")));
  if (error) finish(`/incidents/${formData.get("id")}`, error);
  redirect("/incidents?saved=Report+deleted.");
}

export default async function IncidentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("incident_reports")
    .select("*, buildings(name), events(title, event_date), watch_list(id, full_name), profiles(full_name, email)")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const report = data as unknown as Incident;

  const canManage = user.can("manage_incidents");
  const canEdit = canManage || (report.reported_by === user.id && report.status === "open");
  const options = canEdit ? await incidentFormOptions(supabase, user, report.incident_date) : null;
  const severity = SEVERITIES[report.severity];

  const details: [string, string | null][] = [
    ["When", `${formatDate(report.incident_date)}${report.incident_time ? ` at ${formatTime(report.incident_time)}` : ""}`],
    ["Where", [report.buildings?.name, report.location].filter(Boolean).join(", ") || null],
    ["During", report.events ? `${report.events.title} (${formatDate(report.events.event_date, "short")})` : null],
    ["What happened", report.description],
    ["People involved", report.people_involved],
    ["Actions taken", report.actions_taken],
    ["Outside help", [report.police_called && "Police called", report.ems_called && "EMS called"].filter(Boolean).join(", ") || null],
    ["Filed by", report.profiles ? `${report.profiles.full_name || report.profiles.email} on ${formatDate(localDate(report.created_at), "short")}` : null],
  ];

  return (
    <>
      <Link href="/incidents" className="mb-2 inline-block text-sm text-blue-700 underline">← Incident reports</Link>
      <PageHeader title={report.category}>
        <div className="flex gap-2">
          <span className={`rounded px-2 py-1 text-sm ${severity.className}`}>{severity.label} severity</span>
          <span className={`rounded px-2 py-1 text-sm font-medium ${report.status === "open" ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-700"}`}>
            {report.status === "open" ? "Open" : "Closed"}
          </span>
        </div>
      </PageHeader>
      <Status searchParams={searchParams} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <dl className="space-y-3 text-sm">
              {details.filter(([, v]) => v).map(([label, value]) => (
                <div key={label}>
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="whitespace-pre-wrap">{value}</dd>
                </div>
              ))}
              {report.watch_list && (user.can("view_watch_list") || user.can("manage_watch_list")) && (
                <div>
                  <dt className="text-slate-500">Watch list</dt>
                  <dd><Link href={`/watch-list/${report.watch_list.id}`} className="text-blue-700 underline">{report.watch_list.full_name}</Link></dd>
                </div>
              )}
            </dl>
          </Card>
          {(report.follow_up_notes || canManage) && (
            <Card>
              <h2 className="mb-2 font-semibold">Follow-up</h2>
              {canManage ? (
                <form action={updateFollowUp} className="space-y-3">
                  <input type="hidden" name="id" value={report.id} />
                  <TextArea label="Follow-up notes" name="follow_up_notes" rows={4} defaultValue={report.follow_up_notes ?? ""} />
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="status" value="open" defaultChecked={report.status === "open"} /> Open
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="status" value="closed" defaultChecked={report.status === "closed"} /> Closed
                    </label>
                    <Button type="submit">Save follow-up</Button>
                  </div>
                </form>
              ) : (
                <p className="whitespace-pre-wrap text-sm">{report.follow_up_notes}</p>
              )}
            </Card>
          )}
        </div>
        {canEdit && options && (
          <div className="space-y-6">
            <Card>
              <h2 className="mb-3 font-semibold">Edit report</h2>
              <IncidentForm action={updateReport} incident={report} defaultDate={report.incident_date} {...options} submitLabel="Save changes" />
            </Card>
            {canManage && (
              <Card>
                <form action={deleteReport}>
                  <input type="hidden" name="id" value={report.id} />
                  <Button type="submit" variant="danger">Delete report</Button>
                </form>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );
}
