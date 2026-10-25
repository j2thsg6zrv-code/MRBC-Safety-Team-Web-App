import type { ReactNode } from "react";
import { Nav, type NavItem } from "@/components/Nav";
import { getCurrentUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  const items: NavItem[] = [
    { href: "/", label: "Dashboard" },
    { href: "/events", label: "Events", soon: true },
    ...(user.can("view_watch_list") ? [{ href: "/watch-list", label: "Watch List", soon: true }] : []),
    { href: "/incidents", label: "Incident Reports", soon: true },
    { href: "/members", label: "Safety Team Members" },
    { href: "/buildings", label: "Buildings", soon: true },
    { href: "/positions", label: "Positions", soon: true },
    { href: "/qualifications", label: "Qualifications" },
    ...(user.can("manage_roles") ? [{ href: "/roles", label: "Roles & Permissions" }] : []),
    { href: "/profile", label: "My Profile" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <Nav items={items} userName={user.fullName || user.email} />
      <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
