"use server";

import webpush from "web-push";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type Subscription = { endpoint: string; keys: { p256dh: string; auth: string } };

export async function savePushSubscription(sub: Subscription, device: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!sub?.endpoint?.startsWith("https://") || !sub.keys?.p256dh || !sub.keys?.auth) return { error: "That device didn't give a valid subscription." };
  const supabase = await createClient();
  // A device that was set up by someone else before (shared computer) now belongs to this member.
  await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
  const { error } = await supabase.from("push_subscriptions").insert({
    profile_id: user.id,
    endpoint: sub.endpoint,
    p256dh: sub.keys.p256dh,
    auth: sub.keys.auth,
    device: device.slice(0, 200),
  });
  return error ? { error: "Couldn't save this device. Please try again." } : {};
}

export async function removePushSubscription(endpoint: string) {
  await getCurrentUser();
  const supabase = await createClient();
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
}

export async function pushPublicKey(): Promise<string | null> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data } = await supabase.rpc("push_public_key");
  if (data) return data as string;
  // First time anyone turns notifications on: an admin creates the signing keys.
  if (!user.isAdmin) return null;
  const keys = webpush.generateVAPIDKeys();
  const { data: saved } = await supabase.rpc("push_set_keys", { p_public: keys.publicKey, p_private: keys.privateKey });
  return (saved as string | null) ?? null;
}
