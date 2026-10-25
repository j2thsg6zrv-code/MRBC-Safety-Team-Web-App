import { addDays, today } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

// Sign-up counts are by the date of the event (or greeting Sunday), not the day
// someone tapped "sign up", and only count dates up to today. Sign-ups for
// events still to come are shown separately as "Upcoming".

export const PERIODS = [
  { key: "last30", label: "Last 30 days" },
  { key: "last90", label: "Last 90 days" },
  { key: "last180", label: "Last 180 days" },
  { key: "ytd", label: "Year to date" },
  { key: "upcoming", label: "Upcoming" },
] as const;

type PeriodKey = (typeof PERIODS)[number]["key"];

export type ReportRow = {
  name: string;
  /** Members waiting for approval or turned off are still listed if they served. */
  inactive?: boolean;
  counts: Record<PeriodKey, number>;
  /** One count per month of this year, January first. */
  months: number[];
};

export type Report = {
  generatedOn: string;
  year: number;
  /** "Jan", "Feb", ... up to the current month. */
  monthLabels: string[];
  members: ReportRow[];
  greeters: ReportRow[];
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Supabase returns at most 1,000 rows per request.
const PAGE = 1000;

function emptyRow(name: string, monthCount: number, inactive = false): ReportRow {
  return {
    name,
    inactive,
    counts: { last30: 0, last90: 0, last180: 0, ytd: 0, upcoming: 0 },
    months: Array(monthCount).fill(0),
  };
}

function tally(row: ReportRow, date: string, now: string, yearStart: string) {
  if (date > now) {
    row.counts.upcoming++;
    return;
  }
  if (date >= addDays(now, -29)) row.counts.last30++;
  if (date >= addDays(now, -89)) row.counts.last90++;
  if (date >= addDays(now, -179)) row.counts.last180++;
  if (date >= yearStart) {
    row.counts.ytd++;
    row.months[Number(date.slice(5, 7)) - 1]++;
  }
}

function byMostActive(a: ReportRow, b: ReportRow) {
  return b.counts.ytd - a.counts.ytd || b.counts.last180 - a.counts.last180 || a.name.localeCompare(b.name);
}

async function fetchAll<T>(
  query: (from: number, to: number) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>,
) {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await query(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...((data ?? []) as T[]));
    if (!data || data.length < PAGE) return rows;
  }
}

export async function buildReport(): Promise<Report> {
  const now = today();
  const year = Number(now.slice(0, 4));
  const yearStart = `${year}-01-01`;
  const start = [yearStart, addDays(now, -179)].sort()[0];
  const monthLabels = MONTH_NAMES.slice(0, Number(now.slice(5, 7)));

  const supabase = await createClient();
  const [{ data: profiles }, signups, greeterSignups] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, active").order("full_name"),
    fetchAll<{ id: string; profile_id: string; event_positions: { events: { event_date: string } } }>((from, to) =>
      supabase
        .from("signups")
        .select("id, profile_id, event_positions!inner(events!inner(event_date))")
        .gte("event_positions.events.event_date", start)
        .order("id")
        .range(from, to),
    ),
    fetchAll<{ id: string; name: string; sunday: string }>((from, to) =>
      supabase.from("greeter_signups").select("id, name, sunday").gte("sunday", start).order("id").range(from, to),
    ),
  ]);

  const members = new Map<string, ReportRow>();
  for (const p of profiles ?? []) {
    members.set(p.id, emptyRow(p.full_name || p.email, monthLabels.length, !p.active));
  }
  for (const s of signups) {
    const row = members.get(s.profile_id);
    if (row) tally(row, s.event_positions.events.event_date, now, yearStart);
  }

  // Greeters sign up by typing their name, so group the same name together
  // regardless of capitals or extra spaces.
  const greeters = new Map<string, ReportRow>();
  for (const g of greeterSignups) {
    const name = g.name.trim().replace(/\s+/g, " ");
    const key = name.toLowerCase();
    if (!greeters.has(key)) greeters.set(key, emptyRow(name, monthLabels.length));
    tally(greeters.get(key)!, g.sunday, now, yearStart);
  }

  return {
    generatedOn: now,
    year,
    monthLabels,
    // Hide members who never served and aren't approved (e.g. abandoned sign-ups).
    members: [...members.values()]
      .filter((r) => !r.inactive || Object.values(r.counts).some(Boolean))
      .sort(byMostActive),
    greeters: [...greeters.values()].sort(byMostActive),
  };
}

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function reportCsv(report: Report): string {
  const header = ["Section", "Name", ...PERIODS.map((p) => p.label), ...report.monthLabels.map((m) => `${m} ${report.year}`)];
  const lines = [header];
  for (const [section, rows] of [
    ["Safety team", report.members],
    ["Greeters", report.greeters],
  ] as const) {
    for (const r of rows) {
      lines.push([
        section,
        r.inactive ? `${r.name} (not active)` : r.name,
        ...PERIODS.map((p) => String(r.counts[p.key])),
        ...r.months.map(String),
      ]);
    }
  }
  return lines.map((line) => line.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
