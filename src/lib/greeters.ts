import { addDays, today } from "@/lib/dates";

/** How many Sundays ahead people can sign up to greet. */
export const GREETER_WEEKS = 8;

export const SERVICES = [
  { key: "first_service", label: "Before 8:30 service" },
  { key: "second_service", label: "Before 11:00 service" },
] as const;

/** The next GREETER_WEEKS Sundays, starting today if today is Sunday. */
export function upcomingSundays(count = GREETER_WEEKS): string[] {
  const start = today();
  const weekday = new Date(`${start}T00:00:00Z`).getUTCDay();
  const first = addDays(start, (7 - weekday) % 7);
  return Array.from({ length: count }, (_, i) => addDays(first, i * 7));
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
  phone: string;
  first_service: boolean;
  second_service: boolean;
};

/** Events with "greet" in the title show that Sunday's public greeter sign-ups. */
export function isGreeterEvent(event: { title: string; event_date: string }): boolean {
  return /greet/i.test(event.title) && new Date(`${event.event_date}T00:00:00Z`).getUTCDay() === 0;
}
