import { Button, Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { finish } from "@/lib/forms";
import { emailReady, textReady, type OutboxMessage } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";

async function sendTest(formData: FormData) {
  "use server";
  await requireAdmin();
  const channel = formData.get("channel") === "text" ? "text" : "email";
  const supabase = await createClient();
  const { error } = await supabase.rpc("send_test_message", { p_channel: channel });
  finish("/admin", error, `Test ${channel === "text" ? "text" : "email"} queued. It should arrive within a minute.`);
}

const KINDS: Record<string, string> = {
  thanks: "Thank-you",
  open_spots: "Open spots",
  greeter_reminder: "Greeter reminder",
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
  const ready = { email: emailReady(), text: textReady() };

  return (
    <Card>
      <h2 className="mb-1 font-semibold">Automatic messages</h2>
      <p className="mb-3 text-sm text-slate-600">
        The app thanks people when they sign up for a spot or to greet, reminds the team 48 and 24 hours before an
        event that still has open spots, and texts Sunday&apos;s greeters on Saturday at noon. Members choose email,
        text, or neither on My Profile.
      </p>
      <ul className="mb-3 space-y-1 text-sm">
        {(["email", "text"] as const).map((channel) => (
          <li key={channel} className="flex flex-wrap items-center gap-2">
            <span className={ready[channel] ? "text-green-700" : "text-amber-700"}>
              {ready[channel] ? "✓" : "○"} {channel === "email" ? "Email" : "Texting"}{" "}
              {ready[channel] ? "is set up" : "isn't set up yet"}
            </span>
            {ready[channel] && (
              <form action={sendTest}>
                <input type="hidden" name="channel" value={channel} />
                <Button type="submit" variant="secondary">Send me a test {channel}</Button>
              </form>
            )}
          </li>
        ))}
      </ul>
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
