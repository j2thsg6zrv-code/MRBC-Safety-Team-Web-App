import type { SupabaseClient } from "@supabase/supabase-js";
import { repeatDates, type RepeatRule } from "@/lib/repeat";

/**
 * Makes each event's positions match `positions` (position id → slots).
 * Existing rows are updated in place so sign-ups attached to them survive.
 */
export async function syncEventPositions(
  supabase: SupabaseClient,
  eventIds: string[],
  positions: Record<string, number>,
) {
  const keep = Object.keys(positions);
  let remove = supabase.from("event_positions").delete().in("event_id", eventIds);
  if (keep.length > 0) remove = remove.not("position_id", "in", `(${keep.join(",")})`);
  const { error } = await remove;
  if (error || keep.length === 0) return error;

  const rows = eventIds.flatMap((eventId) =>
    keep.map((positionId) => ({ event_id: eventId, position_id: positionId, slots: positions[positionId] })),
  );
  const { error: upsertError } = await supabase
    .from("event_positions")
    .upsert(rows, { onConflict: "event_id,position_id" });
  return upsertError;
}

type EventFields = {
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  building_id: string | null;
};

/** Checks a submitted repeat setting; returns an error message or null. */
export function repeatError(eventDate: string, rule: RepeatRule | null, until: string | null): string | null {
  if (!rule) return null;
  if (!until) return "Pick a \"Repeat until\" date for a repeating event.";
  if (until < eventDate) return "\"Repeat until\" must be on or after the event's date.";
  return null;
}

/**
 * Makes an event and the dates after it in its series follow `rule` until
 * `until`: adds missing dates (copying the event's details and positions) and
 * removes later dates that no longer fit. If only the end date changed, the
 * series stays one series; otherwise this date starts a new one and earlier
 * dates keep their old schedule. With no rule, it stops repeating from here on.
 */
export async function applyRepeat(
  supabase: SupabaseClient,
  eventId: string,
  rule: RepeatRule | null,
  until: string | null,
  createdBy: string,
) {
  const { data: event, error } = await supabase
    .from("events")
    .select(
      "id, title, description, event_date, start_time, end_time, building_id, series_id, repeat_rule, event_positions(position_id, slots)",
    )
    .eq("id", eventId)
    .single();
  if (error || !event) return { error, ids: [eventId] };

  // Only the end date changed: the whole series stays together.
  const sameSeries = !!event.series_id && !!rule && rule === event.repeat_rule;

  // The old series' dates from this one on, and the ones before it.
  let following: { id: string; event_date: string }[] = [];
  if (event.series_id) {
    const { data } = await supabase
      .from("events")
      .select("id, event_date")
      .eq("series_id", event.series_id)
      .gt("event_date", event.event_date);
    following = data ?? [];
    const { data: earlier } = await supabase
      .from("events")
      .select("event_date")
      .eq("series_id", event.series_id)
      .lt("event_date", event.event_date)
      .order("event_date", { ascending: false })
      .limit(1);
    if (earlier?.[0] && !sameSeries) {
      await supabase
        .from("events")
        .update({ repeat_until: earlier[0].event_date })
        .eq("series_id", event.series_id)
        .lt("event_date", event.event_date);
    }
  }

  const wanted = rule && until ? repeatDates(event.event_date, rule, until) : [event.event_date];
  const keep = following.filter((e) => wanted.includes(e.event_date));
  const remove = following.filter((e) => !wanted.includes(e.event_date)).map((e) => e.id);
  if (remove.length > 0) {
    const { error: removeError } = await supabase.from("events").delete().in("id", remove);
    if (removeError) return { error: removeError, ids: [eventId] };
  }

  const seriesId = sameSeries ? event.series_id : rule ? crypto.randomUUID() : null;
  const repeat = { series_id: seriesId, repeat_rule: rule, repeat_until: rule ? until : null };
  const keepIds = [eventId, ...keep.map((e) => e.id)];
  const { error: updateError } = sameSeries
    ? await supabase.from("events").update({ repeat_until: until }).eq("series_id", event.series_id)
    : await supabase.from("events").update(repeat).in("id", keepIds);
  if (updateError) return { error: updateError, ids: [eventId] };

  const have = new Set([event.event_date, ...keep.map((e) => e.event_date)]);
  const fields: EventFields = {
    title: event.title,
    description: event.description,
    start_time: event.start_time,
    end_time: event.end_time,
    building_id: event.building_id,
  };
  const missing = wanted.filter((d) => !have.has(d));
  let addedIds: string[] = [];
  if (missing.length > 0) {
    const { data: added, error: insertError } = await supabase
      .from("events")
      .insert(missing.map((d) => ({ ...fields, ...repeat, event_date: d, created_by: createdBy })))
      .select("id");
    if (insertError) return { error: insertError, ids: keepIds };
    addedIds = (added ?? []).map((e) => e.id);
    const positions = Object.fromEntries(event.event_positions.map((p) => [p.position_id, p.slots]));
    const positionError = await syncEventPositions(supabase, addedIds, positions);
    if (positionError) return { error: positionError, ids: keepIds };
  }
  return { error: null, ids: [...keepIds, ...addedIds], added: addedIds.length, removed: remove.length };
}
