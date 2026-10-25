import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { emailReady, sendEmail, sendText, textReady, type OutboxMessage } from "@/lib/notifications";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

// The database calls this whenever it queues messages, sending the secret
// from its notification_settings table. Only that secret can collect them.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await supabase.rpc("notifications_claim", { p_secret: secret });
  if (error) return NextResponse.json({ error: error.message }, { status: 401 });

  const results = await Promise.all(
    ((data ?? []) as OutboxMessage[]).map(async (m) => {
      let failure: string | null = null;
      let final = false;
      try {
        if (m.channel === "email") {
          if (!emailReady()) [failure, final] = ["Skipped: email isn't set up yet.", true];
          else await sendEmail(m.recipient, m.subject ?? "MRBC Safety Team", m.body);
        } else if (!textReady()) {
          [failure, final] = ["Skipped: texting isn't set up yet.", true];
        } else {
          await sendText(m.recipient, m.body);
        }
      } catch (e) {
        failure = e instanceof Error ? e.message : String(e);
      }
      await supabase.rpc("notifications_done", { p_secret: secret, p_id: m.id, p_error: failure, p_final: final });
      return !failure;
    }),
  );

  return NextResponse.json({ sent: results.filter(Boolean).length, failed: results.filter((r) => !r).length });
}
