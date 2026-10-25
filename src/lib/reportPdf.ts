import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { formatDate } from "@/lib/dates";
import { PERIODS, type Report, type ReportRow } from "@/lib/reports";

// US Letter, landscape, so twelve month columns fit.
const WIDTH = 792;
const HEIGHT = 612;
const MARGIN = 40;
const ROW = 18;
const NAME_COL = 170;

type Table = { title: string; note?: string; columns: string[]; rows: { name: string; values: number[] }[] };

export async function reportPdf(report: Report): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`MRBC Safety Team sign-up report ${report.generatedOn}`);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page: PDFPage = pdf.addPage([WIDTH, HEIGHT]);
  let y = HEIGHT - MARGIN;

  const write = (text: string, x: number, size: number, f: PDFFont = font, color = rgb(0, 0, 0)) =>
    page.drawText(text, { x, y, size, font: f, color });

  write("MRBC Safety Team sign-up report", MARGIN, 18, bold);
  y -= 18;
  write(
    `Generated ${formatDate(report.generatedOn)}. Counts are by event date; "Upcoming" is sign-ups for events after today.`,
    MARGIN,
    9,
    font,
    rgb(0.35, 0.35, 0.35),
  );
  y -= 26;

  const fitName = (name: string, f: PDFFont, size: number) => {
    // The built-in PDF font only knows Western European letters.
    name = name.replace(/[^\x20-\x7e\xa0-\xff]/g, "?");
    let s = name;
    while (s.length > 1 && f.widthOfTextAtSize(s, size) > NAME_COL - 8) s = s.slice(0, -1);
    return s === name ? s : `${s.slice(0, -1)}…`;
  };

  const drawHeader = (table: Table, colWidth: number) => {
    page.drawRectangle({ x: MARGIN, y: y - 5, width: WIDTH - MARGIN * 2, height: ROW, color: rgb(0.9, 0.92, 0.96) });
    write("Name", MARGIN + 4, 9, bold);
    table.columns.forEach((c, i) => {
      const x = MARGIN + NAME_COL + colWidth * (i + 1) - 6 - bold.widthOfTextAtSize(c, 9);
      write(c, x, 9, bold);
    });
    y -= ROW;
  };

  const drawTable = (table: Table) => {
    const colWidth = (WIDTH - MARGIN * 2 - NAME_COL) / table.columns.length;
    // Keep the title with at least the header and a couple of rows.
    if (y < MARGIN + ROW * 5) {
      page = pdf.addPage([WIDTH, HEIGHT]);
      y = HEIGHT - MARGIN;
    }
    write(table.title, MARGIN, 13, bold);
    y -= 16;
    if (table.note) {
      write(table.note, MARGIN, 9, font, rgb(0.35, 0.35, 0.35));
      y -= 16;
    }
    drawHeader(table, colWidth);
    if (table.rows.length === 0) {
      write("No sign-ups yet.", MARGIN + 4, 9);
      y -= ROW;
    }
    table.rows.forEach((row, n) => {
      if (y < MARGIN) {
        page = pdf.addPage([WIDTH, HEIGHT]);
        y = HEIGHT - MARGIN;
        drawHeader(table, colWidth);
      }
      if (n % 2 === 1) {
        page.drawRectangle({ x: MARGIN, y: y - 5, width: WIDTH - MARGIN * 2, height: ROW, color: rgb(0.97, 0.97, 0.98) });
      }
      write(fitName(row.name, font, 9), MARGIN + 4, 9);
      row.values.forEach((v, i) => {
        const s = String(v);
        write(s, MARGIN + NAME_COL + colWidth * (i + 1) - 6 - font.widthOfTextAtSize(s, 9), 9, v ? bold : font);
      });
      y -= ROW;
    });
    y -= 20;
  };

  const label = (r: ReportRow) => (r.inactive ? `${r.name} (not active)` : r.name);
  const summary = (rows: ReportRow[]) => rows.map((r) => ({ name: label(r), values: PERIODS.map((p) => r.counts[p.key]) }));
  const monthly = (rows: ReportRow[]) => rows.map((r) => ({ name: label(r), values: r.months }));
  const columns = PERIODS.map((p) => p.label);

  drawTable({ title: "Safety team position sign-ups", columns, rows: summary(report.members) });
  drawTable({ title: `Safety team sign-ups by month, ${report.year}`, columns: report.monthLabels, rows: monthly(report.members) });
  const greeterNote = "From the public greeter sign-up page, grouped by the name each person typed. One count per Sunday.";
  drawTable({ title: "Greeter sign-ups", note: greeterNote, columns, rows: summary(report.greeters) });
  drawTable({ title: `Greeter sign-ups by month, ${report.year}`, columns: report.monthLabels, rows: monthly(report.greeters) });

  return pdf.save();
}
