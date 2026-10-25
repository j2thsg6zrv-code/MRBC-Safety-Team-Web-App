import type { ReactNode } from "react";
import { ChatLive } from "@/components/ChatLive";
import { ChatSidebar } from "@/components/ChatSidebar";
import { getCurrentUser } from "@/lib/auth";
import { TEAM, type Conversation } from "@/lib/chat";
import { createClient } from "@/lib/supabase/server";

type Overview = { conversation: string; last_at: string; last_body: string; last_sender: string; unread: number };

export default async function ChatLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const [{ data: overview }, { data: members }] = await Promise.all([
    supabase.rpc("chat_overview"),
    supabase.from("profiles").select("id, full_name, email").eq("active", true).neq("id", user.id).order("full_name"),
  ]);
  const byId = new Map(((overview ?? []) as Overview[]).map((o) => [o.conversation, o]));
  const toConversation = (id: string, name: string): Conversation => {
    const o = byId.get(id);
    return {
      id,
      name,
      lastAt: o?.last_at ?? null,
      lastBody: o?.last_body ?? null,
      lastFromMe: o?.last_sender === user.id,
      unread: o?.unread ?? 0,
    };
  };
  // Whole team first, then people you've talked with most recently, then everyone else A to Z.
  const people = (members ?? [])
    .map((m) => toConversation(m.id, m.full_name || m.email))
    .sort((a, b) => (b.lastAt ?? "").localeCompare(a.lastAt ?? "") || a.name.localeCompare(b.name));
  const conversations = [toConversation(TEAM, "Whole team"), ...people];

  return (
    <div className="-mx-4 -my-6 grid h-[calc(100dvh-3.25rem)] md:-mx-8 md:h-dvh md:grid-cols-[18rem_1fr]">
      <ChatLive me={user.id} />
      <ChatSidebar conversations={conversations} />
      {children}
    </div>
  );
}
