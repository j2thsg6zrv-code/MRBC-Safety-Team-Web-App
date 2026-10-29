import type { ReactNode } from "react";
import { Nav, type NavItem } from "@/components/Nav";
import { Card } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user.active) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <Card className="w-full max-w-md">
          <h1 className="mb-2 text-xl font-semibold">Waiting for approval</h1>
          <p className="mb-4 text-slate-700">
            Thanks for signing up, {user.fullName || user.email}. A safety team admin needs to approve your account
            before you can see the schedule. Check back soon.
          </p>
          <form action="/auth/signout" method="post">
            <button className="text-sm text-blue-700 underline">Sign out</button>
          </form>
        </Card>
      </main>
    );
  }

  // Badge counts for the menu, fetched together.
  const supabase = await createClient();
  const [{ count: waiting }, { count: toContact }, { data: chats }] = await Promise.all([
    user.can("manage_members")
      ? supabase.from("profiles").select("id", { count: "exact", head: true }).eq("active", false)
      : Promise.resolve({ count: 0 }),
    // People who filled in the public "Join the safety team" form and haven't been contacted.
    user.isAdmin
      ? supabase.from("join_interest").select("id", { count: "exact", head: true }).is("contacted_at", null)
      : Promise.resolve({ count: 0 }),
    supabase.rpc("chat_overview"),
  ]);
  const unreadChats = ((chats ?? []) as { unread: number }[]).reduce((sum, c) => sum + c.unread, 0);

  const items: NavItem[] = [
    { href: "/", label: "Dashboard" },
    { href: "/chat", label: unreadChats ? `Team Chat (${unreadChats} new)` : "Team Chat" },
    { href: "/events", label: "Events" },
    { href: "/greeter-schedule", label: "Greeters" },
    ...(user.can("view_watch_list") || user.can("manage_watch_list") ? [{ href: "/watch-list", label: "Watch List" }] : []),
    { href: "/incidents", label: "Incident Reports" },
    { href: "/training", label: "Training" },
    { href: "/members", label: waiting ? `Safety Team Members (${waiting} waiting)` : "Safety Team Members" },
    { href: "/buildings", label: "Buildings" },
    { href: "/positions", label: "Positions" },
    { href: "/certifications", label: "My Certifications" },
    { href: "/share", label: "Share" },
    ...(user.isAdmin ? [{ href: "/admin", label: toContact ? `Admin (${toContact} to contact)` : "Admin" }] : []),
    { href: "/profile", label: "My Profile" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <Nav items={items} userName={user.fullName || user.email} />
      <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
