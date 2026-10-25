import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getTheme } from "@/lib/theme";

export const metadata: Metadata = {
  title: { default: "MRBC Safety Team", template: "%s · MRBC Safety Team" },
  description: "Scheduling and safety information for the church safety team.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme={await getTheme()}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
