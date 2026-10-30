import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ErrorReporter } from "@/components/ErrorReporter";
import { PullToRefresh } from "@/components/PullToRefresh";
import { getTheme } from "@/lib/theme";

export const metadata: Metadata = {
  title: { default: "MRBC Safety Team", template: "%s · MRBC Safety Team" },
  description: "Scheduling and safety information for the church safety team.",
  appleWebApp: { capable: true, title: "MRBC Safety" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme={await getTheme()}>
      <body className="antialiased">
        <ErrorReporter />
        <PullToRefresh />
        {children}
      </body>
    </html>
  );
}
