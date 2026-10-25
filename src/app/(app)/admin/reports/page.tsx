import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { buildReport, PERIODS, type ReportRow } from "@/lib/reports";

const exportLink =
  "inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50";

function ReportTable({ columns, rows, values }: { columns: string[]; rows: ReportRow[]; values: (r: ReportRow) => number[] }) {
  if (rows.length === 0) return <p className="text-sm text-slate-500">No sign-ups yet.</p>;
  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className="sticky left-0 bg-slate-50 px-3 py-2 font-medium">Name</th>
            {columns.map((c) => (
              <th key={c} className="whitespace-nowrap px-3 py-2 text-right font-medium">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, n) => (
            <tr key={n} className="border-b border-slate-200 last:border-0">
              <td className="sticky left-0 whitespace-nowrap bg-white px-3 py-2">
                {r.name}
                {r.inactive && <span className="ml-1 text-xs text-slate-500">(not active)</span>}
              </td>
              {values(r).map((v, i) => (
                <td key={i} className={`px-3 py-2 text-right tabular-nums ${v ? "font-medium" : "text-slate-400"}`}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export default async function ReportsPage() {
  await requireAdmin();
  const report = await buildReport();
  const periodColumns = PERIODS.map((p) => p.label);
  const summary = (r: ReportRow) => PERIODS.map((p) => r.counts[p.key]);
  const monthly = (r: ReportRow) => r.months;

  return (
    <>
      <PageHeader title="Sign-up reports">
        <div className="flex flex-wrap gap-2">
          <a href="/admin/reports/export?format=pdf" className={exportLink} download>Download PDF</a>
          <a href="/admin/reports/export?format=csv" className={exportLink} download>Download CSV</a>
        </div>
      </PageHeader>
      <p className="mb-6 text-sm text-slate-600">
        <Link href="/admin" className="text-blue-700 underline">Admin</Link> &rsaquo; Reports. How many positions each
        person signed up for, counted by the date of the event, up to today ({formatDate(report.generatedOn)}).
        &ldquo;Upcoming&rdquo; is sign-ups for events that haven&apos;t happened yet. The CSV opens in Excel or Google
        Sheets.
      </p>

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Safety team</h2>
          <ReportTable columns={periodColumns} rows={report.members} values={summary} />
          <h3 className="pt-2 font-semibold">By month, {report.year}</h3>
          <ReportTable columns={report.monthLabels} rows={report.members} values={monthly} />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Greeters</h2>
          <p className="text-sm text-slate-600">
            From the public greeter sign-up page, grouped by the name each person typed, one count per Sunday. If
            someone spelled their name two ways, they&apos;ll show up twice.
          </p>
          <ReportTable columns={periodColumns} rows={report.greeters} values={summary} />
          <h3 className="pt-2 font-semibold">By month, {report.year}</h3>
          <ReportTable columns={report.monthLabels} rows={report.greeters} values={monthly} />
        </section>
      </div>
    </>
  );
}
