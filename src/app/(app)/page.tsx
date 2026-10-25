import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, monthRange, type DaySummary } from "@/components/Calendar";
import { DayPanel, type DayEvent } from "@/components/DayPanel";
import { expiryStatus } from "@/components/QualificationList";
import { Card, ErrorMessage, SuccessMessage } from "@/components/ui";
import { getCurrentUser, requirePermission } from "@/lib/auth";
import { formatDate, formatTimeRange, today } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

/** Only allow redirects back to the dashboard. */
function back(formData: FormData, result: { saved?: string; error?: string }) {
  const to = String(formData.get("return_to") ?? "/");
  const url = new URL(to.startsWith("/?") ? to : "/", "http://x");
  url.searchParams.delete("saved");
  url.searchParams.delete("error");
  for (const [k, v] of Object.entries(result)) if (v) url.searchParams.set(k, v);
  redirect(`${url.pathname}${url.search}`);
}

async function signUp(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("signups")
    .insert({ event_position_id: String(formData.get("event_position_id")), profile_id: user.id });
  back(formData, error ? { error: error.message } : { saved: "You're signed up. Thank you for serving!" });
}

async function assign(formData: FormData) {
  "use server";
  await requirePermission("manage_events");
  const supabase = await createClient();
  const { error } = await supabase.from("signups").insert({
    event_position_id: String(formData.get("event_position_id")),
    profile_id: String(formData.get("profile_id")),
  });
  back(formData, error ? { error: error.message } : { saved: "Assigned." });
}

async function cancel(formData: FormData) {
  "use server";
  await getCurrentUser();
  const supabase = await createClient();
  const { error } = await supabase.from("signups").delete().eq("id", String(formData.get("signup_id")));
  back(formData, error ? { error: error.message } : { saved: "Sign-up cancelled." });
}

type MySignup = {
  id: string;
  event_positions: {
    positions: { name: string } | null;
    events: { id: string; title: string; event_date: string; start_time: string; end_time: string | null };
  };
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; day?: string; saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const supabase = await createClient();
  const todayDate = today();

  const month = /^\d{4}-\d{2}$/.test(params.month ?? "") ? params.month! : todayDate.slice(0, 7);
  const { first, last } = monthRange(month);
  const selected =
    params.day && params.day.startsWith(month) ? params.day : todayDate.startsWith(month) ? todayDate : null;

  const [{ data: eventData }, { data: myQuals }, { data: mySignupData }, { data: members }] = await Promise.all([
    supabase
      .from("events")
      .select(
        "id, title, description, event_date, start_time, end_time, buildings(name), event_positions(id, slots, positions(name, description, required_qualification_id, qualifications(name)), signups(id, profile_id, profiles(full_name, email)))",
      )
      .gte("event_date", first)
      .lte("event_date", last)
      .order("start_time"),
    supabase
      .from("member_qualifications")
      .select("qualification_id, expires_on, qualifications(name)")
      .eq("profile_id", user.id),
    supabase
      .from("signups")
      .select("id, event_positions!inner(positions(name), events!inner(id, title, event_date, start_time, end_time))")
      .eq("profile_id", user.id)
      .gte("event_positions.events.event_date", todayDate),
    user.can("manage_events")
      ? supabase.from("profiles").select("id, full_name, email").eq("active", true).order("full_name")
      : Promise.resolve({ data: [] as { id: string; full_name: string; email: string }[] }),
  ]);

  const events = (eventData ?? []) as unknown as DayEvent[];
  const days: Record<string, DaySummary> = {};
  for (const e of events) {
    const day = (days[e.event_date] ??= { events: 0, open: 0, mine: false });
    day.events += 1;
    for (const ep of e.event_positions) {
      day.open += Math.max(0, ep.slots - ep.signups.length);
      if (ep.signups.some((s) => s.profile_id === user.id)) day.mine = true;
    }
  }

  const sortByName = (a: DayEvent["event_positions"][number], b: DayEvent["event_positions"][number]) =>
    (a.positions?.name ?? "").localeCompare(b.positions?.name ?? "");
  const dayEvents = events
    .filter((e) => e.event_date === selected)
    .map((e) => ({ ...e, event_positions: [...e.event_positions].sort(sortByName) }));

  const currentQuals = new Set(
    (myQuals ?? [])
      .filter((q) => !q.expires_on || (selected ? q.expires_on >= selected : q.expires_on >= todayDate))
      .map((q) => q.qualification_id),
  );
  const expiring = (myQuals ?? [])
    .map((q) => ({ ...q, status: expiryStatus(q.expires_on) }))
    .filter((q) => q.status.className !== "text-slate-500");

  const mySignups = ((mySignupData ?? []) as unknown as MySignup[])
    .map((s) => ({ id: s.id, position: s.event_positions.positions?.name, event: s.event_positions.events }))
    .sort((a, b) => (a.event.event_date + a.event.start_time).localeCompare(b.event.event_date + b.event.start_time))
    .slice(0, 6);

  const returnTo = `/?month=${month}${selected ? `&day=${selected}` : ""}`;

  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">
        Welcome{user.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}
      </h1>
      <div className="mb-4 space-y-2 empty:hidden">
        <ErrorMessage message={params.error} />
        <SuccessMessage message={params.saved} />
      </div>
      {/* On phones the selected day sits right under the calendar; on wide screens it's a side column. */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
        <Card className="xl:col-start-1">
          <Calendar month={month} selected={selected} todayDate={todayDate} days={days} />
        </Card>
        <div className="xl:col-start-2 xl:row-span-2 xl:row-start-1">
          {selected ? (
            <DayPanel
              date={selected}
              events={dayEvents}
              userId={user.id}
              isPast={selected < todayDate}
              canManage={user.can("manage_events")}
              myQualifications={currentQuals}
              members={(members ?? []).map((m) => ({ id: m.id, name: m.full_name || m.email }))}
              actions={{ signUp, cancel, assign }}
              returnTo={returnTo}
            />
          ) : (
            <Card><p className="text-sm text-slate-600">Pick a day on the calendar to see its events and open positions.</p></Card>
          )}
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:col-start-1">
          <Card>
            <h2 className="mb-2 font-semibold">My upcoming shifts</h2>
            {mySignups.length === 0 ? (
              <p className="text-sm text-slate-600">You haven&apos;t signed up for anything yet. Pick a day on the calendar.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {mySignups.map((s) => (
                  <li key={s.id}>
                    <Link href={`/?month=${s.event.event_date.slice(0, 7)}&day=${s.event.event_date}`} className="hover:underline">
                      <span className="font-medium">{formatDate(s.event.event_date, "short")}</span>
                      {" · "}{s.position} at {s.event.title}
                      <span className="block text-xs text-slate-500">{formatTimeRange(s.event.start_time, s.event.end_time)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card>
            <h2 className="mb-2 font-semibold">My qualifications</h2>
            {expiring.length === 0 ? (
              <p className="text-sm text-slate-600">
                {(myQuals ?? []).length === 0 ? "None recorded yet." : "All current."}{" "}
                <Link href="/profile" className="text-blue-700 underline">View profile</Link>
              </p>
            ) : (
              <ul className="space-y-1 text-sm">
                {expiring.map((q) => (
                  <li key={q.qualification_id}>
                    {(q.qualifications as unknown as { name: string } | null)?.name}:{" "}
                    <span className={q.status.className}>{q.status.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
