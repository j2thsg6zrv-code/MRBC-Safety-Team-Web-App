"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// "← Dashboard" button at the top of every main page (Events, Buildings, Admin…).
// Not shown on the dashboard itself, on pages one level deeper (those already
// link back to their own list, e.g. "← All events"), or in Team Chat, which
// has its own link in the chat sidebar.
export function BackToDashboard() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 1 || segments[0] === "chat") return null;
  return <DashboardLink className="mb-4" />;
}

export function DashboardLink({ className = "" }: { className?: string }) {
  return (
    // Same look as the app's secondary (white, outlined) buttons so it stands out.
    <Link
      href="/"
      className={`inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 ${className}`}
    >
      ← Dashboard
    </Link>
  );
}
