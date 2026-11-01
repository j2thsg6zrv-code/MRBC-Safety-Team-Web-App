import { notFound } from "next/navigation";
import { ChatThread } from "@/components/ChatThread";
import { getCurrentUser } from "@/lib/auth";
import { CHAT_BUCKET, isMemberId, MESSAGES_SHOWN, TEAM, type ChatMessage, type ChatReaction } from "@/lib/chat";
import { createClient } from "@/lib/supabase/server";

export default async function ChatConversation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id !== TEAM && !isMemberId(id)) notFound();
  const user = await getCurrentUser();
  const supabase = await createClient();

  let query = supabase
    .from("chat_messages")
    .select("id, sender_id, recipient_id, body, created_at, image_path, reply_to")
    .order("created_at", { ascending: false })
    .limit(MESSAGES_SHOWN);
  query =
    id === TEAM
      ? query.is("recipient_id", null)
      : query.or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${id}),and(sender_id.eq.${id},recipient_id.eq.${user.id})`,
        );

  const [{ data: messages }, { data: people }] = await Promise.all([
    query,
    supabase.from("profiles").select("id, full_name, email, active"),
  ]);
  const names = Object.fromEntries((people ?? []).map((p) => [p.id, p.full_name || p.email]));
  const other = people?.find((p) => p.id === id);
  if (id !== TEAM && (!other || id === user.id)) notFound();

  const list = ((messages ?? []) as ChatMessage[]).reverse();
  // Reactions on these messages, and short-lived links for their pictures.
  const paths = list.map((m) => m.image_path).filter((p): p is string => !!p);
  const [{ data: reactions }, { data: signed }] = await Promise.all([
    list.length
      ? supabase.from("chat_reactions").select("message_id, profile_id, emoji").in("message_id", list.map((m) => m.id)).order("created_at")
      : Promise.resolve({ data: [] }),
    paths.length
      ? supabase.storage.from(CHAT_BUCKET).createSignedUrls(paths, 60 * 60 * 6)
      : Promise.resolve({ data: [] as { path: string | null; signedUrl: string }[] }),
  ]);
  const pictures: Record<string, string> = {};
  for (const s of signed ?? []) if (s.path && s.signedUrl) pictures[s.path] = s.signedUrl;

  return (
    <ChatThread
      key={id}
      conversation={id}
      title={id === TEAM ? "Whole team" : names[id]}
      subtitle={id === TEAM ? "Everyone on the safety team sees these messages." : other?.active ? "Just the two of you." : "No longer an active member."}
      canSend={id === TEAM || !!other?.active}
      me={user.id}
      isAdmin={user.isAdmin}
      names={names}
      messages={list}
      reactions={(reactions ?? []) as ChatReaction[]}
      pictures={pictures}
      showingLatest={(messages?.length ?? 0) >= MESSAGES_SHOWN}
    />
  );
}
