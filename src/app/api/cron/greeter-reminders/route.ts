import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL } from "@/lib/supabase/config";
import { addDays, formatDate, today } from "@/lib/dates";

// Texts Sunday's greeters a reminder on Saturday at noon, church time.
// Vercel runs this at 17:00 and 18:00 UTC on Saturdays (vercel.json) so one of
// the two lands on noon Central whether or not daylight saving is on.
//
// Needs these Vercel environment variables; without them it does nothing:
//   CRON_SECRET                 any long random text (Vercel sends it to prove the call is real)
//   SUPABASE_SERVICE_ROLE_KEY   Supabase → Project Settings → API keys → secret key
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER (e.g. +18005551234)

const TIME_ZONE = process.env.APP_TIME_ZONE ?? "America/Chicago";
const TIMES = { first_service: "8:30", second_service: "11:00" } as const;

function churchHour(): number {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, hour: "numeric", hourCycle: "h23" }).format(new Date()));
}

/** "(806) 577-5546" → "+18065775546". */
function toE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export async function GET(request: NextRequest) {
  const env = process.env;
  if (!env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  if (!env.SUPABASE_SERVICE_ROLE_KEY || !env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM_NUMBER) {
    return NextResponse.json({ skipped: "Texting isn't set up yet." });
  }

  const date = today();
  const isSaturday = new Date(`${date}T00:00:00Z`).getUTCDay() === 6;
  const force = request.nextUrl.searchParams.get("force") === "1";
  if (!force && (!isSaturday || churchHour() !== 12)) {
    return NextResponse.json({ skipped: "Not Saturday noon." });
  }

  const sunday = addDays(date, 1);
  const supabase = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("greeter_signups")
    .select("name, phone, first_service, second_service")
    .eq("sunday", sunday)
    .not("phone", "is", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // One text per phone number, naming every service that number signed up for.
  const byPhone = new Map<string, { name: string; services: Set<string> }>();
  for (const s of data ?? []) {
    const to = toE164(s.phone);
    if (!to) continue;
    const entry = byPhone.get(to) ?? { name: s.name, services: new Set<string>() };
    if (s.first_service) entry.services.add(TIMES.first_service);
    if (s.second_service) entry.services.add(TIMES.second_service);
    byPhone.set(to, entry);
  }

  const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString("base64");
  const results = await Promise.all(
    [...byPhone].map(async ([to, { name, services }]) => {
      const times = [...services].sort((a, b) => (a === "8:30" ? -1 : b === "8:30" ? 1 : 0)).join(" and ");
      const body =
        `Hi ${name.split(" ")[0]}! Reminder: you're signed up to greet tomorrow, ${formatDate(sunday)}, ` +
        `before the ${times} ${services.size > 1 ? "services" : "service"}. Thank you for serving! - MRBC Safety Team`;
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: "POST",
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ To: to, From: env.TWILIO_FROM_NUMBER!, Body: body }),
      });
      return { to: to.slice(-4), ok: res.ok, status: res.status };
    }),
  );

  return NextResponse.json({ sunday, sent: results.filter((r) => r.ok).length, results });
}
