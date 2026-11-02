import Link from "next/link";
import { Status } from "@/components/Status";
import { Card, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, formatTimeRange, today } from "@/lib/dates";
import { repeatBadge, type RepeatRule } from "@/lib/repeat";
import { createClient } from "@/lib/supabase/server";

type EventRow = {
  id: string;
  title: string;
  event_date: string;
  start_time: string;
  end_time: string | null;
  repeat_rule: RepeatRule | null;
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
    .select("id, title, event_date, start_time, end_time, repeat_rule, series_id, buildings(name), event_positions(slots)");
  query = past
    ? query.lt("event_date", today()).order("event_date", { ascending: false }).limit(300)
    : query.gte("event_date", today()).order("event_date").order("start_time").limit(500);
  const { data } = await query;
  const events = (data ?? []) as unknown as EventRow[];

  // Repeating events share a series id: show each series once, at its next (or most recent) date.
  const groups: EventRow[][] = [];
  const bySeries = new Map<string, EventRow[]>();
  for (const e of events) {
    if (e.series_id && e.repeat_rule) {
      const group = bySeries.get(e.series_id);
      if (group) {
        group.push(e);
        continue;
      }
      bySeries.set(e.series_id, [e]);
      groups.push(bySeries.get(e.series_id)!);
    } else {
      groups.push([e]);
    }
  }

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
            {groups.map((group) =>
              group.length === 1 ? (
                <li key={group[0].id}>
                  <EventLink event={group[0]} />
                </li>
              ) : (
                <li key={group[0].series_id}>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                      <div>
                        <p className="font-medium">
                          <span className="mr-1 inline-block text-slate-400 group-open:rotate-90">▸</span>
                          {group[0].title}
                          <span className="ml-2 rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                            {repeatBadge(group[0].repeat_rule)}
                          </span>
                        </p>
                        <p className="text-sm text-slate-500">
                          {past ? "Last" : "Next"}: {formatDate(group[0].event_date)} ·{" "}
                          {formatTimeRange(group[0].start_time, group[0].end_time)}
                          {group[0].buildings && ` · ${group[0].buildings.name}`}
                        </p>
                      </div>
                      <span className="text-sm text-slate-600">
                        {group.length} {past ? "past" : "upcoming"} dates
                        {!past && ` · through ${formatDate(group[group.length - 1].event_date, "short")}`}
                      </span>
                    </summary>
                    <ul className="divide-y divide-slate-100 border-t border-slate-100 bg-slate-50/50 pl-6">
                      {group.map((e) => (
                        <li key={e.id}>
                          <EventLink event={e} compact />
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ),
            )}
          </ul>
        </Card>
      )}
    </>
  );
}

function EventLink({ event: e, compact }: { event: EventRow; compact?: boolean }) {
  const spots = e.event_positions.reduce((sum, p) => sum + p.slots, 0);
  return (
    <Link
      href={`/events/${e.id}`}
      className={`flex flex-wrap items-center justify-between gap-2 px-4 hover:bg-slate-50 ${compact ? "py-2 text-sm" : "py-3"}`}
    >
      <div>
        {compact ? (
          <p>
            <span className="font-medium">{formatDate(e.event_date)}</span>
            <span className="text-slate-500"> · {formatTimeRange(e.start_time, e.end_time)}</span>
          </p>
        ) : (
          <>
            <p className="font-medium">
              {e.title}
              {e.repeat_rule && (
                <span className="ml-2 rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{repeatBadge(e.repeat_rule)}</span>
              )}
            </p>
            <p className="text-sm text-slate-500">
              {formatDate(e.event_date)} · {formatTimeRange(e.start_time, e.end_time)}
              {e.buildings && ` · ${e.buildings.name}`}
            </p>
          </>
        )}
      </div>
      <span className="text-sm text-slate-600">{spots} spots</span>
    </Link>
  );
}
