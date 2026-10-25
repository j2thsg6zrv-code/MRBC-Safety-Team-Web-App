import Link from "next/link";

export type DaySummary = { events: number; slots: number; open: number; mine: boolean };

type DayStatus = "mine" | "short" | "full" | null;

// Blue when you're serving, red when spots are still open, green when every spot is filled.
// Past days only stay blue (there's nothing left to fill).
function dayStatus(info: DaySummary | undefined, isPast: boolean): DayStatus {
  if (!info) return null;
  if (info.mine) return "mine";
  if (isPast || info.slots === 0) return null;
  return info.open > 0 ? "short" : "full";
}

const STATUS_CELL: Record<Exclude<DayStatus, null>, string> = {
  mine: "border-blue-300 bg-blue-100 hover:border-blue-400",
  short: "border-red-300 bg-red-100 hover:border-red-600",
  full: "border-green-300 bg-green-100 hover:border-green-700",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

export function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { first: `${month}-01`, last: `${month}-${String(last).padStart(2, "0")}`, days: last };
}

export function Calendar({
  month,
  selected,
  todayDate,
  days,
}: {
  month: string;
  selected: string | null;
  todayDate: string;
  days: Record<string, DaySummary>;
}) {
  const { days: count } = monthRange(month);
  const leading = new Date(`${month}-01T00:00:00Z`).getUTCDay();
  const title = new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  });
  const cells: (string | null)[] = [
    ...Array(leading).fill(null),
    ...Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`),
  ];

  const navLink = "rounded-md border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-50";

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <Link href={`/?month=${shiftMonth(month, -1)}`} className={navLink} aria-label="Previous month">←</Link>
        <div className="text-center">
          <h2 className="text-lg font-semibold">{title}</h2>
          {month !== todayDate.slice(0, 7) && (
            <Link href="/" className="text-xs text-blue-700 underline">Back to this month</Link>
          )}
        </div>
        <Link href={`/?month=${shiftMonth(month, 1)}`} className={navLink} aria-label="Next month">→</Link>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
        {WEEKDAYS.map((d) => <div key={d} className="py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />;
          const info = days[date];
          const isSelected = date === selected;
          const isToday = date === todayDate;
          const isPast = date < todayDate;
          const status = dayStatus(info, isPast);
          return (
            <Link
              key={date}
              href={`/?month=${month}&day=${date}`}
              scroll={false}
              aria-current={isToday ? "date" : undefined}
              className={`flex min-h-14 flex-col items-center rounded-md p-1 text-sm sm:min-h-20 sm:items-start sm:p-2 ${
                isToday ? "border-2" : "border"
              } ${
                status
                  ? STATUS_CELL[status]
                  : info
                    ? "border-slate-200 bg-white hover:border-slate-400"
                    : `${isToday ? "" : "border-transparent"} bg-white/50 hover:bg-white`
              } ${isToday ? "!border-slate-900" : ""} ${
                isSelected ? "ring-2 ring-slate-500" : ""
              } ${isPast ? "text-slate-400" : ""}`}
            >
              <span className="flex items-center gap-1">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    isToday ? "bg-slate-900 font-semibold text-slate-50" : ""
                  }`}
                >
                  {Number(date.slice(8))}
                </span>
                {isToday && <span className="hidden text-xs font-semibold text-slate-900 sm:inline">Today</span>}
              </span>
              {info && (
                <span className="mt-auto flex flex-col items-center gap-0.5 text-[10px] font-medium sm:items-start sm:text-xs">
                  {status === "mine" && (
                    <span className="text-blue-800">
                      <span className="sm:hidden">✓</span>
                      <span className="hidden sm:inline">You&apos;re serving</span>
                    </span>
                  )}
                  {info.open > 0 && !isPast ? (
                    <span className={status === "mine" ? "text-blue-800" : "text-red-800"}>
                      {info.open}<span className="hidden sm:inline"> open</span>
                    </span>
                  ) : status === "full" ? (
                    <span className="text-green-800">
                      <span className="sm:hidden">✓</span>
                      <span className="hidden sm:inline">All filled</span>
                    </span>
                  ) : (
                    status !== "mine" && (
                      <span className="font-normal text-slate-600">
                        {info.events}<span className="hidden sm:inline"> {info.events === 1 ? "event" : "events"}</span>
                      </span>
                    )
                  )}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
        <Legend className="border-blue-300 bg-blue-100">You&apos;re signed up</Legend>
        <Legend className="border-red-300 bg-red-100">Needs volunteers</Legend>
        <Legend className="border-green-300 bg-green-100">All spots filled</Legend>
        <Legend className="border-2 border-slate-900 bg-white">Today</Legend>
      </div>
    </div>
  );
}

function Legend({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block h-4 w-4 rounded border ${className}`} />
      {children}
    </span>
  );
}
