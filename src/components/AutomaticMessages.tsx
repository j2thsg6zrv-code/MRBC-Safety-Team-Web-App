import { Button, Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { finish } from "@/lib/forms";
import { emailReady, type OutboxMessage } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";

async function sendTest() {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.rpc("send_test_message", { p_channel: "email" });
  finish("/admin", error, "Test email queued. It should arrive within a minute.");
}

const KINDS: Record<string, string> = {
  thanks: "Thank-you",
  open_spots: "Open spots",
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
  const { data } = await supabase
    .from("notification_outbox")
    .select("id, kind, channel, recipient, created_at, sent_at, error")
    .order("created_at", { ascending: false })
    .limit(25);
  const messages = (data ?? []) as OutboxMessage[];
  const ready = emailReady();

  return (
    <Card>
      <h2 className="mb-1 font-semibold">Automatic messages</h2>
      <p className="mb-3 text-sm text-slate-600">
        The app thanks people when they sign up for a spot or to greet, reminds the team 48 and 24 hours before an
        event that still has open spots, and emails Sunday&apos;s greeters on Saturday at noon. Everything goes by
        email. Members can turn messages off on My Profile.
      </p>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className={ready ? "text-green-700" : "text-amber-700"}>
          {ready ? "✓ Email is set up" : "○ Email isn't set up yet"}
        </span>
        {ready && (
          <form action={sendTest}>
            <Button type="submit" variant="secondary">Send me a test email</Button>
          </form>
        )}
      </div>
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
