"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { markRead } from "@/app/(app)/chat/actions";
import { conversationOf, TEAM, type ChatMessage } from "@/lib/chat";
import { playChatSound, unlockChatSound } from "@/lib/chat-sound";
import { createClient } from "@/lib/supabase/client";

/**
 * Listens for new and deleted chat messages (and reactions) and refreshes the page when one
 * arrives. A message in the open conversation is marked read straight away.
 * Mounted on every page so a new message from someone else plays the alert
 * sound wherever you are in the app.
 */
export function ChatLive({ me }: { me: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const open = useRef<string | null>(null);
  open.current = pathname.startsWith("/chat/") ? pathname.slice("/chat/".length) : null;

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let stopped = false;

    supabase.auth.getSession().then(({ data }) => {
      if (stopped) return;
      if (data.session) supabase.realtime.setAuth(data.session.access_token);
      channel = supabase
        .channel("chat")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
          const message = payload.new as ChatMessage;
          if (message.sender_id === me) return; // sending already refreshed the page
          const conversation = conversationOf(message, me);
          playChatSound(conversation === TEAM ? "team" : "direct");
          if (conversation === open.current) markRead(conversation);
          else router.refresh();
        })
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "chat_messages" }, () => router.refresh())
        // Reactions only show inside a conversation, so only refresh there.
        .on("postgres_changes", { event: "*", schema: "public", table: "chat_reactions" }, (payload) => {
          const reaction = (payload.eventType === "DELETE" ? payload.old : payload.new) as { profile_id?: string };
          if (reaction.profile_id === me) return; // reacting already refreshed the page
          if (open.current) router.refresh();
        })
        .subscribe();
    });

    // Phones pause the connection while the screen is off, so catch up on return.
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (open.current) markRead(open.current);
      else if (window.location.pathname.startsWith("/chat")) router.refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    // Browsers block sound until the person taps or types, so unlock it then.
    const unlock = () => unlockChatSound();
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);

    return () => {
      stopped = true;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      if (channel) supabase.removeChannel(channel);
    };
  }, [me, router]);

  return null;
}
