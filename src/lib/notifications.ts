import nodemailer from "nodemailer";

// Automatic messages go out by email through a Gmail or iCloud account, using
// these Vercel environment variables (Settings → Environment Variables):
//   GMAIL_ADDRESS, GMAIL_APP_PASSWORD   (the address and its app password;
//   an @icloud.com, @me.com or @mac.com address works too)
// Everything is email only for now (no paid texting). Texting through Twilio
// still works if the database ever queues a text and these are added:
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER (e.g. +18005551234)
// The database decides what to send; see supabase/migrations/0013_notifications.sql.

const emailAddress = () => process.env.GMAIL_ADDRESS?.trim() ?? "";
// App passwords are often copied with spaces ("abcd efgh ijkl mnop").
const emailPassword = () => process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "") ?? "";

export const emailReady = () => !!(emailAddress() && emailPassword());
export const textReady = () =>
  !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);

export type OutboxMessage = {
  id: string;
  kind: string;
  channel: "email" | "text";
  recipient: string;
  subject: string | null;
  body: string;
  created_at: string;
  sent_at: string | null;
  error: string | null;
};

/** "(806) 577-5546" → "+18065775546". */
export function toE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

let mailer: nodemailer.Transporter | null = null;

export async function sendEmail(to: string, subject: string, body: string) {
  const auth = { user: emailAddress(), pass: emailPassword() };
  mailer ??= /@(icloud|me|mac)\.com$/i.test(auth.user)
    ? nodemailer.createTransport({ host: "smtp.mail.me.com", port: 587, requireTLS: true, auth })
    : nodemailer.createTransport({ service: "gmail", auth });
  await mailer.sendMail({
    from: { name: "MRBC Safety Team", address: auth.user },
    to,
    subject,
    text: body,
  });
}

export async function sendText(to: string, body: string) {
  const number = toE164(to);
  if (!number) throw new Error(`"${to}" isn't a US phone number.`);
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: number, From: process.env.TWILIO_FROM_NUMBER!, Body: body }),
  });
  if (!res.ok) {
    const detail = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(detail?.message ?? `Twilio said ${res.status}`);
  }
}
