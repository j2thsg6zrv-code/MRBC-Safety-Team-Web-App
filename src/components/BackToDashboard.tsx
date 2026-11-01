"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// "← Dashboard" link at the top of every main page (Events, Buildings, Admin…).
// Not shown on the dashboard itself, on pages one level deeper (those already
// link back to their own list, e.g. "← All events"), or in Team Chat, which
// has its own link in the chat sidebar.
export function BackToDashboard() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 1 || segments[0] === "chat") return null;
  return <DashboardLink className="mb-2" />;
}

export function DashboardLink({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-block text-sm text-blue-700 underline ${className}`}>
      ← Dashboard
    </Link>
  );
}
