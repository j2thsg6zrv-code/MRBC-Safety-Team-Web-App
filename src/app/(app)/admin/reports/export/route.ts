import { requireAdmin } from "@/lib/auth";
import { buildReport, reportCsv } from "@/lib/reports";
import { reportPdf } from "@/lib/reportPdf";

export async function GET(request: Request) {
  await requireAdmin();
  const format = new URL(request.url).searchParams.get("format");
  const report = await buildReport();
  const name = `mrbc-sign-up-report-${report.generatedOn}`;

  if (format === "pdf") {
    return new Response(Buffer.from(await reportPdf(report)), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  }
  return new Response(reportCsv(report), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
