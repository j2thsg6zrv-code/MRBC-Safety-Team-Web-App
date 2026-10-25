import { addDays } from "@/lib/dates";

export const REPEAT_RULES = {
  weekly: "Every week",
  biweekly: "Every other week",
  monthly_date: "Every month on the same date",
  monthly_weekday: "Every month on the same weekday",
} as const;

export type RepeatRule = keyof typeof REPEAT_RULES;

/** Most dates a single repeat can create (two years of weekly events). */
export const MAX_REPEATS = 104;

export function parseRepeatRule(value: unknown): RepeatRule | null {
  return typeof value === "string" && value in REPEAT_RULES ? (value as RepeatRule) : null;
}

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th"];

function parts(date: string) {
  const d = new Date(`${date}T00:00:00Z`);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate(), weekday: d.getUTCDay() };
}

function iso(year: number, month: number, day: number): string | null {
  const d = new Date(Date.UTC(year, month, day));
  return d.getUTCMonth() === ((month % 12) + 12) % 12 ? d.toISOString().slice(0, 10) : null;
}

/** The nth (1-based) given weekday of a month, or null if that month doesn't have one. */
function nthWeekday(year: number, month: number, weekday: number, n: number): string | null {
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  return iso(year, month, 1 + ((weekday - firstWeekday + 7) % 7) + (n - 1) * 7);
}

/** Every date from `start` through `until` (inclusive) on which the event happens. */
export function repeatDates(start: string, rule: RepeatRule, until: string): string[] {
  const dates: string[] = [];
  const s = parts(start);
  for (let i = 0; dates.length < MAX_REPEATS; i++) {
    let date: string | null;
    if (rule === "weekly" || rule === "biweekly") {
      date = addDays(start, i * (rule === "weekly" ? 7 : 14));
    } else {
      const year = s.year + Math.floor((s.month + i) / 12);
      const month = (s.month + i) % 12;
      date =
        rule === "monthly_date"
          ? iso(year, month, s.day) // skips months that are too short, e.g. the 31st
          : nthWeekday(year, month, s.weekday, Math.ceil(s.day / 7));
      if (i > 1200) break;
    }
    if (date && date > until) break;
    if (date) dates.push(date);
  }
  return dates;
}

function ordinal(n: number): string {
  const teen = n % 100 >= 11 && n % 100 <= 13;
  return `${n}${teen ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
}

/** A sentence like "Repeats every month on the 2nd Sunday until Dec 27, 2026". */
export function describeRepeat(rule: RepeatRule, start: string, until: string | null): string {
  const s = parts(start);
  const weekday = new Date(`${start}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long" });
  const how = {
    weekly: `every ${weekday}`,
    biweekly: `every other ${weekday}`,
    monthly_date: `every month on the ${ordinal(s.day)}`,
    monthly_weekday: `every month on the ${ORDINALS[Math.ceil(s.day / 7) - 1]} ${weekday}`,
  }[rule];
  const end = until
    ? new Date(`${until}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" })
    : null;
  return `Repeats ${how}${end ? ` until ${end}` : ""}`;
}

/** Short label for event lists. */
export function repeatBadge(rule: RepeatRule | null): string | null {
  if (!rule) return null;
  return { weekly: "Weekly", biweekly: "Every 2 weeks", monthly_date: "Monthly", monthly_weekday: "Monthly" }[rule];
}
