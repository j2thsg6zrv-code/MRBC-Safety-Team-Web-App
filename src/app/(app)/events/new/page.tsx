import Link from "next/link";
import { redirect } from "next/navigation";
import { EventForm, readEventForm } from "@/components/EventForm";
import { Status } from "@/components/Status";
import { Card, PageHeader } from "@/components/ui";
import { requirePermission } from "@/lib/auth";
import { addDays } from "@/lib/dates";
import { syncEventPositions } from "@/lib/events";
import { finish, type SearchParams } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

async function createEvent(formData: FormData) {
  "use server";
  const user = await requirePermission("manage_events");
  const supabase = await createClient();
  const { data: allPositions } = await supabase.from("positions").select("id");
  const { fields, eventDate, positions } = readEventForm(formData, (allPositions ?? []).map((p) => p.id));

  const repeatWeeks = Math.min(52, Math.max(0, Number(formData.get("repeat_weeks")) || 0));
  const seriesId = repeatWeeks > 0 ? crypto.randomUUID() : null;
  const rows = Array.from({ length: repeatWeeks + 1 }, (_, week) => ({
    ...fields,
    event_date: addDays(eventDate, week * 7),
    series_id: seriesId,
    created_by: user.id,
  }));

  const { data: created, error } = await supabase.from("events").insert(rows).select("id");
  if (error || !created) finish("/events/new", error);

  const positionError = await syncEventPositions(supabase, created.map((e) => e.id), positions);
  if (positionError) finish("/events/new", positionError);

  redirect(created.length === 1 ? `/events/${created[0].id}?saved=Event+created.` : `/events?saved=${created.length}+events+created.`);
}

export default async function NewEventPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePermission("manage_events");
  const supabase = await createClient();
  const [{ data: buildings }, { data: positions }] = await Promise.all([
    supabase.from("buildings").select("id, name").order("name"),
    supabase.from("positions").select("id, name").order("name"),
  ]);

  return (
    <>
      <Link href="/events" className="mb-2 inline-block text-sm text-blue-700 underline">← All events</Link>
      <PageHeader title="New Event" />
      <Status searchParams={searchParams} />
      <Card>
        <EventForm action={createEvent} buildings={buildings ?? []} positions={positions ?? []} submitLabel="Create event" />
      </Card>
    </>
  );
}
