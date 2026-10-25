import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EventForm, readEventForm, type EventFormValues } from "@/components/EventForm";
import { Status } from "@/components/Status";
import { Button, Card, PageHeader } from "@/components/ui";
import { getCurrentUser, requirePermission } from "@/lib/auth";
import { formatDate, formatTimeRange } from "@/lib/dates";
import { syncEventPositions } from "@/lib/events";
import { finish, type SearchParams } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

type EventDetail = EventFormValues & {
  id: string;
  buildings: { name: string } | null;
  event_positions: { position_id: string; slots: number; positions: { name: string } | null }[];
};

/** The ids of this event, plus later events in its series when scope is "following". */
async function targetEventIds(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("series_id, event_date").eq("id", id).single();
  if (formData.get("scope") !== "following" || !event?.series_id) return { id, ids: [id] };
  const { data: series } = await supabase
    .from("events")
    .select("id")
    .eq("series_id", event.series_id)
    .gte("event_date", event.event_date);
  return { id, ids: (series ?? []).map((e) => e.id) };
}

async function updateEvent(formData: FormData) {
  "use server";
  await requirePermission("manage_events");
  const supabase = await createClient();
  const { data: allPositions } = await supabase.from("positions").select("id");
  const { fields, eventDate, positions } = readEventForm(formData, (allPositions ?? []).map((p) => p.id));
  const { id, ids } = await targetEventIds(formData);

  const { error } = await supabase.from("events").update(fields).in("id", ids);
  if (error) finish(`/events/${id}`, error);
  const { error: dateError } = await supabase.from("events").update({ event_date: eventDate }).eq("id", id);
  if (dateError) finish(`/events/${id}`, dateError);

  const positionError = await syncEventPositions(supabase, ids, positions);
  finish(`/events/${id}`, positionError, ids.length > 1 ? `Saved ${ids.length} events.` : "Saved.");
}

async function deleteEvent(formData: FormData) {
  "use server";
  await requirePermission("manage_events");
  const supabase = await createClient();
  const { id, ids } = await targetEventIds(formData);
  const { error } = await supabase.from("events").delete().in("id", ids);
  if (error) finish(`/events/${id}`, error);
  redirect(`/events?saved=${ids.length > 1 ? `${ids.length}+events+deleted.` : "Event+deleted."}`);
}

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const supabase = await createClient();
  const [{ data }, { data: buildings }, { data: positions }] = await Promise.all([
    supabase
      .from("events")
      .select("*, buildings(name), event_positions(position_id, slots, positions(name))")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("buildings").select("id, name").order("name"),
    supabase.from("positions").select("id, name").order("name"),
  ]);
  if (!data) notFound();
  const event = data as unknown as EventDetail;
  event.positions = Object.fromEntries(event.event_positions.map((p) => [p.position_id, p.slots]));

  return (
    <>
      <Link href="/events" className="mb-2 inline-block text-sm text-blue-700 underline">← All events</Link>
      <PageHeader title={event.title} />
      <p className="-mt-4 mb-4 text-slate-600">
        {formatDate(event.event_date)} · {formatTimeRange(event.start_time, event.end_time)}
        {event.buildings && ` · ${event.buildings.name}`}
      </p>
      <Status searchParams={searchParams} />
      {user.can("manage_events") ? (
        <div className="space-y-6">
          <Card>
            <EventForm action={updateEvent} event={event} buildings={buildings ?? []} positions={positions ?? []} submitLabel="Save changes" />
          </Card>
          <Card>
            <h2 className="mb-2 font-semibold">Delete event</h2>
            <form action={deleteEvent} className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="id" value={event.id} />
              {event.series_id && (
                <select name="scope" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                  <option value="one">Only this date</option>
                  <option value="following">This and all following dates</option>
                </select>
              )}
              <Button type="submit" variant="danger">Delete</Button>
            </form>
          </Card>
        </div>
      ) : (
        <Card>
          {event.description && <p className="mb-3 text-slate-700">{event.description}</p>}
          <h2 className="mb-2 font-semibold">Positions</h2>
          <ul className="space-y-1 text-sm">
            {event.event_positions.map((p) => (
              <li key={p.position_id}>{p.positions?.name}: {p.slots} {p.slots === 1 ? "person" : "people"}</li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
