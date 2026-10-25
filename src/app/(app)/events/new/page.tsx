import Link from "next/link";
import { redirect } from "next/navigation";
import { EventForm, readEventForm } from "@/components/EventForm";
import { Status } from "@/components/Status";
import { Card, PageHeader } from "@/components/ui";
import { requirePermission } from "@/lib/auth";
import { repeatError, syncEventPositions } from "@/lib/events";
import { finish, type SearchParams } from "@/lib/forms";
import { repeatDates } from "@/lib/repeat";
import { createClient } from "@/lib/supabase/server";

async function createEvent(formData: FormData) {
  "use server";
  const user = await requirePermission("manage_events");
  const supabase = await createClient();
  const { data: allPositions } = await supabase.from("positions").select("id");
  const { fields, eventDate, positions, repeatRule, repeatUntil } = readEventForm(
    formData,
    (allPositions ?? []).map((p) => p.id),
  );
  const invalid = repeatError(eventDate, repeatRule, repeatUntil);
  if (invalid) finish("/events/new", { message: invalid });

  const dates = repeatRule && repeatUntil ? repeatDates(eventDate, repeatRule, repeatUntil) : [eventDate];
  const repeat = repeatRule
    ? { series_id: crypto.randomUUID(), repeat_rule: repeatRule, repeat_until: repeatUntil }
    : { series_id: null, repeat_rule: null, repeat_until: null };
  const rows = dates.map((date) => ({ ...fields, ...repeat, event_date: date, created_by: user.id }));

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
