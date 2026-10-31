import { SendReminders, type UpcomingEvent } from "@/components/SendReminders";
import { Button, Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { addDays, today } from "@/lib/dates";
import { finish } from "@/lib/forms";
import { emailReady, senderAddress, type OutboxMessage } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";

async function sendTest() {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.rpc("send_test_message", { p_channel: "email" });
  finish("/admin", error, "Test email queued. It should arrive within a minute.");
}

function days(formData: FormData) {
  const n = Number(formData.get("days"));
  return Number.isInteger(n) && n >= 1 && n <= 60 ? n : 7;
}

const people = (n: number) => `${n} ${n === 1 ? "person" : "people"}`;

async function sendShiftReminders(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("send_shift_reminders", { p_days: days(formData) });
  finish("/admin", error, `Reminders are on their way to ${people(Number(data ?? 0))}.`);
}

async function sendOpenSpots(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("send_open_spots_alert", { p_days: days(formData) });
  finish("/admin", error, `The open-spots email is on its way to ${people(Number(data ?? 0))}.`);
}

type EventRow = {
  event_date: string;
  start_time: string;
  title: string;
  event_positions: { slots: number; positions: { name: string } | null; signups: { profile_id: string }[] }[];
};

/** Events from now through the next 30 days, for the send buttons' preview. */
async function upcomingEvents(supabase: Awaited<ReturnType<typeof createClient>>): Promise<UpcomingEvent[]> {
  const start = today();
  const nowTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: process.env.APP_TIME_ZONE ?? "America/Chicago",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
  const { data } = await supabase
    .from("events")
    .select("event_date, start_time, title, event_positions(slots, positions(name), signups(profile_id))")
    .gte("event_date", start)
    .lt("event_date", addDays(start, 30))
    .order("event_date")
    .order("start_time");
  return ((data ?? []) as unknown as EventRow[])
    .filter((e) => e.event_date > start || e.start_time >= nowTime)
    .map((e) => ({
      date: e.event_date,
      time: e.start_time,
      title: e.title,
      daysAway: Math.round((Date.parse(e.event_date) - Date.parse(start)) / 86_400_000),
      positions: e.event_positions
        .map((ep) => ({ name: ep.positions?.name ?? "Position", slots: ep.slots, profileIds: ep.signups.map((s) => s.profile_id) }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

const KINDS: Record<string, string> = {
  thanks: "Thank-you",
  open_spots: "Open spots",
  shift_reminder: "Shift reminder",
  greeter_reminder: "Greeter reminder",
  invite: "Invite",
  new_member: "New member",
  test: "Test",
};

function when(timestamp: string) {
  return new Date(timestamp).toLocaleString("en-US", {
    timeZone: process.env.APP_TIME_ZONE ?? "America/Chicago",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Admin card: whether email and texting are set up, a test button, and recent messages. */
export async function AutomaticMessages() {
  const supabase = await createClient();
  const [{ data }, events, { data: members }] = await Promise.all([
    supabase
      .from("notification_outbox")
      .select("id, kind, channel, recipient, created_at, sent_at, error")
      .order("created_at", { ascending: false })
      .limit(25),
    upcomingEvents(supabase),
    supabase.from("profiles").select("id, notify_by").eq("active", true),
  ]);
  const team = (members ?? []) as { id: string; notify_by: string }[];
  const messages = (data ?? []) as OutboxMessage[];
  const ready = emailReady();

  return (
    <Card>
      <h2 className="mb-1 font-semibold">Automatic messages</h2>
      <p className="mb-3 text-sm text-slate-600">
        The app thanks people when they sign up for a spot or to greet, reminds everyone signed up 48 and 24 hours
        before their shift, reminds the team 48 and 24 hours before an event that still has open spots, and emails
        Sunday&apos;s greeters on Saturday at noon. Everything goes by
        email. Members can turn messages off on My Profile.
      </p>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className={ready ? "text-green-700" : "text-amber-700"}>
          {ready ? `✓ Email is set up, sending from ${senderAddress()}` : "○ Email isn't set up yet"}
        </span>
        {ready && (
          <form action={sendTest}>
            <Button type="submit" variant="secondary">Send me a test email</Button>
          </form>
        )}
      </div>
      {ready && (
        <div className="mb-3">
          <h3 className="mb-2 text-sm font-semibold">Send now</h3>
          <SendReminders
            events={events}
            emailable={team.filter((m) => m.notify_by !== "none").map((m) => m.id)}
            teamSize={team.length}
            remindAction={sendShiftReminders}
            openSpotsAction={sendOpenSpots}
          />
        </div>
      )}
      {messages.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm font-medium">Recent messages</summary>
          <ul className="mt-2 divide-y divide-slate-200 text-sm">
            {messages.map((m) => (
              <li key={m.id} className="py-1.5">
                <span className="font-medium">{KINDS[m.kind] ?? m.kind}</span> {m.channel} to {m.recipient}
                <span className="text-slate-500"> · {when(m.created_at)} · </span>
                {m.sent_at ? (
                  <span className="text-green-700">Sent</span>
                ) : m.error ? (
                  <span className="text-amber-700">{m.error}</span>
                ) : (
                  <span className="text-slate-500">Waiting</span>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </Card>
  );
}
