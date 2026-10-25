import { addDays, today } from "@/lib/dates";

/** How many months ahead people can sign up to greet. */
export const GREETER_MONTHS = 3;

export const SERVICES = [
  { key: "first_service", label: "Before 8:30 service" },
  { key: "second_service", label: "Before 11:00 service" },
] as const;

/** Every Sunday from today (if today is Sunday) through GREETER_MONTHS months ahead. */
export function upcomingSundays(months = GREETER_MONTHS): string[] {
  const start = today();
  const end = new Date(`${start}T00:00:00Z`);
  end.setUTCMonth(end.getUTCMonth() + months);
  const last = end.toISOString().slice(0, 10);
  const weekday = new Date(`${start}T00:00:00Z`).getUTCDay();
  const sundays: string[] = [];
  for (let d = addDays(start, (7 - weekday) % 7); d <= last; d = addDays(d, 7)) sundays.push(d);
  return sundays;
}

/** The address of the public sign-up page, for sharing and the QR code. */
export function publicGreetersUrl(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrbc-safety-team-web-app.vercel.app";
  return `${site.replace(/\/$/, "")}/greeters`;
}

export type GreeterSignup = {
  id: string;
  sunday: string;
  name: string;
  phone: string | null;
  first_service: boolean;
  second_service: boolean;
};

/** Events with "greet" in the title show that Sunday's public greeter sign-ups. */
export function isGreeterEvent(event: { title: string; event_date: string }): boolean {
  return /greet/i.test(event.title) && new Date(`${event.event_date}T00:00:00Z`).getUTCDay() === 0;
}
