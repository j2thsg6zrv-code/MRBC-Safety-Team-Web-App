import { QrCodeLink } from "@/components/QrCodeLink";
import QRCode from "qrcode";
import { ShareLink } from "@/components/ShareLink";
import { Card, PageHeader } from "@/components/ui";
import { publicGreetersUrl } from "@/lib/greeters";
import { siteUrl } from "@/lib/site";

const CODES = [
  {
    heading: "Sunday greeters",
    blurb:
      "Anyone can scan this to sign up to greet before the 8:30 or 11:00 service. No account needed, and they only see first names on the schedule.",
    url: publicGreetersUrl(),
    title: "Greet on Sunday at MRBC",
    message: "Sign up to greet before a Sunday service at MRBC:",
    fileName: "mrbc-greeter-sign-up-qr.png",
  },
  {
    heading: "Join the safety team",
    blurb:
      "For anyone interested in serving on the safety team. They leave their name, phone, email and the best time to call, and admins follow up from the Admin page.",
    url: siteUrl("/join"),
    title: "Join the MRBC Safety Team",
    message: "Interested in serving on the MRBC safety team? Let us know here:",
    fileName: "mrbc-join-safety-team-qr.png",
  },
];

export default async function SharePage() {
  const codes = await Promise.all(
    CODES.map(async (code) => ({
      ...code,
      svg: await QRCode.toString(code.url, { type: "svg", margin: 1 }),
      png: await QRCode.toDataURL(code.url, { width: 800, margin: 2 }),
    })),
  );

  return (
    <>
      <PageHeader title="Share" />
      <div className="space-y-6">
        {codes.map((code) => (
          <Card key={code.url}>
            <h2 className="mb-1 font-semibold">{code.heading}</h2>
            <p className="mb-4 text-sm text-slate-600">{code.blurb}</p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <QrCodeLink url={code.url} svg={code.svg} className="w-48 shrink-0 rounded-md bg-white p-2 [&_svg]:h-auto [&_svg]:w-full" />
              <div className="min-w-0 space-y-3">
                <a href={code.url} target="_blank" rel="noopener noreferrer" className="block break-all font-mono text-sm text-blue-700 underline">{code.url}</a>
                <ShareLink
                  url={code.url}
                  title={code.title}
                  message={code.message}
                  qrPng={code.png}
                  qrFileName={code.fileName}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
