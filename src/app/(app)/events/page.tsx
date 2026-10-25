import Link from "next/link";
import { Status } from "@/components/Status";
import { Card, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, formatTimeRange, today } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

type EventRow = {
  id: string;
  title: string;
  event_date: string;
  start_time: string;
  end_time: string | null;
  series_id: string | null;
  buildings: { name: string } | null;
  event_positions: { slots: number }[];
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ past?: string; saved?: string; error?: string }>;
}) {
  const { past } = await searchParams;
  const user = await getCurrentUser();
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select("id, title, event_date, start_time, end_time, series_id, buildings(name), event_positions(slots)");
  query = past
    ? query.lt("event_date", today()).order("event_date", { ascending: false }).limit(100)
    : query.gte("event_date", today()).order("event_date").order("start_time").limit(200);
  const { data } = await query;
  const events = (data ?? []) as unknown as EventRow[];

  return (
    <>
      <PageHeader title={past ? "Past Events" : "Upcoming Events"}>
        <div className="flex gap-2">
          <Link
            href={past ? "/events" : "/events?past=1"}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            {past ? "Upcoming events" : "Past events"}
          </Link>
          {user.can("manage_events") && (
            <Link href="/events/new" className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-onaccent hover:brightness-90">
              New event
            </Link>
          )}
        </div>
      </PageHeader>
      <Status searchParams={searchParams} />
      {events.length === 0 ? (
        <Card><p className="text-slate-600">No events {past ? "in the past" : "scheduled yet"}.</p></Card>
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-slate-100">
            {events.map((e) => (
              <li key={e.id}>
                <Link href={`/events/${e.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-slate-50">
                  <div>
                    <p className="font-medium">
                      {e.title}
                      {e.series_id && <span className="ml-2 rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">Weekly</span>}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatDate(e.event_date)} · {formatTimeRange(e.start_time, e.end_time)}
                      {e.buildings && ` · ${e.buildings.name}`}
                    </p>
                  </div>
                  <span className="text-sm text-slate-600">
                    {e.event_positions.reduce((sum, p) => sum + p.slots, 0)} spots
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
