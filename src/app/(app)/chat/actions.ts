"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { CHAT_BUCKET, isMemberId, MAX_MESSAGE_LENGTH, picturePrefix, QUICK_REACTIONS, TEAM } from "@/lib/chat";
import { createClient } from "@/lib/supabase/server";

function checkConversation(conversation: string) {
  if (conversation !== TEAM && !isMemberId(conversation)) throw new Error("Unknown conversation.");
}

/**
 * Sends a message. The browser uploads any picture to storage first and passes
 * its path here; `replyTo` is the message being answered.
 */
export async function sendMessage(
  conversation: string,
  body: string,
  imagePath: string | null = null,
  replyTo: string | null = null,
): Promise<{ error?: string }> {
  checkConversation(conversation);
  const user = await getCurrentUser();
  const text = body.trim();
  const prefix = picturePrefix(conversation, user.id);
  if (imagePath && !(imagePath.startsWith(prefix) && /^[\w.-]+$/.test(imagePath.slice(prefix.length)))) {
    return { error: "That picture didn't upload. Please try again." };
  }
  if (replyTo && !isMemberId(replyTo)) replyTo = null;
  if (!text && !imagePath) return {};
  if (text.length > MAX_MESSAGE_LENGTH) return { error: `Messages can be up to ${MAX_MESSAGE_LENGTH} characters.` };
  const supabase = await createClient();
  const { error } = await supabase.from("chat_messages").insert({
    sender_id: user.id,
    recipient_id: conversation === TEAM ? null : conversation,
    body: text,
    image_path: imagePath,
    reply_to: replyTo,
  });
  if (error) {
    if (imagePath) await supabase.storage.from(CHAT_BUCKET).remove([imagePath]);
    return { error: "Your message didn't send. Please try again." };
  }
  // Sending counts as having read everything before it.
  await supabase
    .from("chat_reads")
    .upsert({ profile_id: user.id, conversation, last_read_at: new Date().toISOString() });
  revalidatePath("/", "layout");
  return {};
}

export async function markRead(conversation: string) {
  checkConversation(conversation);
  const user = await getCurrentUser();
  const supabase = await createClient();
  await supabase
    .from("chat_reads")
    .upsert({ profile_id: user.id, conversation, last_read_at: new Date().toISOString() });
  revalidatePath("/", "layout");
}

export async function deleteMessage(id: string) {
  if (!isMemberId(id)) return;
  await getCurrentUser();
  const supabase = await createClient();
  // Row level security only lets people delete their own (admins: team posts too).
  const { data } = await supabase.from("chat_messages").delete().eq("id", id).select("image_path");
  const paths = (data ?? []).map((m) => m.image_path).filter((p): p is string => !!p);
  if (paths.length > 0) await supabase.storage.from(CHAT_BUCKET).remove(paths);
  revalidatePath("/", "layout");
}

/** Adds your emoji reaction to a message, or takes it back if you'd already added it. */
export async function toggleReaction(messageId: string, emoji: string) {
  if (!isMemberId(messageId) || !QUICK_REACTIONS.includes(emoji)) return;
  const user = await getCurrentUser();
  const supabase = await createClient();
  const mine = { message_id: messageId, profile_id: user.id, emoji };
  const { data } = await supabase.from("chat_reactions").delete().match(mine).select("emoji");
  if (!data?.length) await supabase.from("chat_reactions").insert(mine);
  revalidatePath("/chat", "layout");
}
