"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { isMemberId, MAX_MESSAGE_LENGTH, TEAM } from "@/lib/chat";
import { createClient } from "@/lib/supabase/server";

function checkConversation(conversation: string) {
  if (conversation !== TEAM && !isMemberId(conversation)) throw new Error("Unknown conversation.");
}

export async function sendMessage(conversation: string, body: string): Promise<{ error?: string }> {
  checkConversation(conversation);
  const user = await getCurrentUser();
  const text = body.trim();
  if (!text) return {};
  if (text.length > MAX_MESSAGE_LENGTH) return { error: `Messages can be up to ${MAX_MESSAGE_LENGTH} characters.` };
  const supabase = await createClient();
  const { error } = await supabase.from("chat_messages").insert({
    sender_id: user.id,
    recipient_id: conversation === TEAM ? null : conversation,
    body: text,
  });
  if (error) return { error: "Your message didn't send. Please try again." };
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
  await supabase.from("chat_messages").delete().eq("id", id);
  revalidatePath("/", "layout");
}
