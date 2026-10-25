import type { SupabaseClient } from "@supabase/supabase-js";

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
