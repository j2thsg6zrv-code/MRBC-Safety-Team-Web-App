import Link from "next/link";
import { SEVERITIES } from "@/components/IncidentForm";
import { Status } from "@/components/Status";
import { Card, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, formatTime } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

type Row = {
  id: string;
  incident_date: string;
  incident_time: string | null;
  category: string;
  severity: keyof typeof SEVERITIES;
  status: "open" | "closed";
  location: string | null;
  buildings: { name: string } | null;
  profiles: { full_name: string } | null;
};

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; saved?: string; error?: string }>;
}) {
  const { status } = await searchParams;
  const user = await getCurrentUser();
  const seesAll = user.can("view_incidents") || user.can("manage_incidents");
  const supabase = await createClient();

  let query = supabase
    .from("incident_reports")
    .select("id, incident_date, incident_time, category, severity, status, location, buildings(name), profiles(full_name)")
    .order("incident_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);
  if (status === "open" || status === "closed") query = query.eq("status", status);
  const { data } = await query;
  const reports = (data ?? []) as unknown as Row[];

  const filter = (value: string | undefined, label: string) => (
    <Link
      href={value ? `/incidents?status=${value}` : "/incidents"}
      className={`rounded-full px-3 py-1 text-sm ${status === value ? "bg-slate-800 text-white" : "bg-white text-slate-700 hover:bg-slate-200"}`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <PageHeader title="Incident Reports">
        <Link href="/incidents/new" className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-onaccent hover:brightness-90">
          File a report
        </Link>
      </PageHeader>
      {!seesAll && <p className="mb-4 text-sm text-slate-600">You can see the reports you&apos;ve filed.</p>}
      <Status searchParams={searchParams} />
      <div className="mb-4 flex gap-2">
        {filter(undefined, "All")}
        {filter("open", "Open")}
        {filter("closed", "Closed")}
      </div>
      {reports.length === 0 ? (
        <Card><p className="text-slate-600">No incident reports.</p></Card>
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-slate-100">
            {reports.map((r) => (
              <li key={r.id}>
                <Link href={`/incidents/${r.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-slate-50">
                  <div>
                    <p className="font-medium">
                      {r.category}
                      <span className={`ml-2 rounded px-2 py-0.5 text-xs ${SEVERITIES[r.severity].className}`}>
                        {SEVERITIES[r.severity].label}
                      </span>
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatDate(r.incident_date, "short")}
                      {r.incident_time && ` · ${formatTime(r.incident_time)}`}
                      {(r.buildings || r.location) && ` · ${[r.buildings?.name, r.location].filter(Boolean).join(", ")}`}
                      {r.profiles && ` · Filed by ${r.profiles.full_name}`}
                    </p>
                  </div>
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${r.status === "open" ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-700"}`}>
                    {r.status === "open" ? "Open" : "Closed"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
