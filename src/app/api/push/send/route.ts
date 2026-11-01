import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import webpush from "web-push";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

type Claim = {
  vapid_public: string | null;
  vapid_private: string | null;
  site_url: string;
  title: string;
  body: string;
  url: string;
  tag: string;
  subscriptions: { endpoint: string; p256dh: string; auth: string }[];
};

// The database calls this when a chat message is posted, with the same secret
// it uses for emails. Only that secret can read who to push to.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  const { message_id } = (await request.json().catch(() => ({}))) as { message_id?: string };
  if (!message_id) return NextResponse.json({ error: "No message." }, { status: 400 });

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await supabase.rpc("push_claim", { p_secret: secret, p_message_id: message_id });
  if (error) return NextResponse.json({ error: error.message }, { status: 401 });
  const claim = data as Claim | null;
  if (!claim || !claim.vapid_public || !claim.vapid_private) return NextResponse.json({ sent: 0 });

  const payload = JSON.stringify({ title: claim.title, body: claim.body, url: claim.url, tag: claim.tag });
  const options = {
    vapidDetails: { subject: claim.site_url, publicKey: claim.vapid_public, privateKey: claim.vapid_private },
    TTL: 60 * 60 * 12,
    urgency: "high" as const,
  };

  const results = await Promise.all(
    claim.subscriptions.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, options);
        return true;
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        // The device unsubscribed or the app was removed: stop trying it.
        if (status === 404 || status === 410) await supabase.rpc("push_forget", { p_secret: secret, p_endpoint: s.endpoint });
        return false;
      }
    }),
  );
  return NextResponse.json({ sent: results.filter(Boolean).length, failed: results.filter((r) => !r).length });
}
