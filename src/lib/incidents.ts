import type { SupabaseClient } from "@supabase/supabase-js";
import { addDays, formatDate } from "@/lib/dates";
import type { CurrentUser } from "@/lib/auth";

/** Choices for the incident form's buildings, recent events and watch list menus. */
export async function incidentFormOptions(supabase: SupabaseClient, user: CurrentUser, around: string) {
  const [{ data: buildings }, { data: events }, { data: watchList }] = await Promise.all([
    supabase.from("buildings").select("id, name").order("name"),
    supabase
      .from("events")
      .select("id, title, event_date")
      .gte("event_date", addDays(around, -14))
      .lte("event_date", addDays(around, 1))
      .order("event_date", { ascending: false }),
    user.can("view_watch_list") || user.can("manage_watch_list")
      ? supabase.from("watch_list").select("id, full_name").eq("archived", false).order("full_name")
      : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
  ]);
  return {
    buildings: buildings ?? [],
    events: (events ?? []).map((e) => ({ id: e.id, name: `${formatDate(e.event_date, "short")} · ${e.title}` })),
    watchList: (watchList ?? []).map((w) => ({ id: w.id, name: w.full_name })),
  };
}
