import Link from "next/link";

export type DaySummary = { events: number; open: number; mine: boolean };

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
          return (
            <Link
              key={date}
              href={`/?month=${month}&day=${date}`}
              scroll={false}
              className={`flex min-h-14 flex-col items-center rounded-md border p-1 text-sm sm:min-h-20 sm:items-start sm:p-2 ${
                isSelected
                  ? "border-blue-700 bg-blue-50 ring-1 ring-blue-700"
                  : info
                    ? "border-slate-200 bg-white hover:border-blue-400"
                    : "border-transparent bg-white/50 hover:bg-white"
              } ${isPast ? "opacity-60" : ""}`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  isToday ? "bg-blue-700 font-semibold text-white" : ""
                }`}
              >
                {Number(date.slice(8))}
              </span>
              {info && (
                <span className="mt-auto flex flex-col items-center gap-0.5 sm:items-start">
                  {info.mine && (
                    <span className="rounded bg-green-100 px-1 text-[10px] font-medium text-green-800 sm:text-xs">
                      <span className="sm:hidden">✓</span>
                      <span className="hidden sm:inline">You&apos;re serving</span>
                    </span>
                  )}
                  {info.open > 0 && !isPast ? (
                    <span className="rounded bg-amber-100 px-1 text-[10px] font-medium text-amber-800 sm:text-xs">
                      {info.open}<span className="hidden sm:inline"> open</span>
                    </span>
                  ) : (
                    !info.mine && (
                      <span className="rounded bg-slate-100 px-1 text-[10px] text-slate-600 sm:text-xs">
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
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
        <span><span className="rounded bg-amber-100 px-1 text-amber-800">3 open</span> spots still needed</span>
        <span><span className="rounded bg-green-100 px-1 text-green-800">You&apos;re serving</span> you&apos;re signed up</span>
      </div>
    </div>
  );
}
