"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { finish, text } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

// Qualifications and certifications are recorded the same way: a member holds
// one from the date earned until it expires. Members add their own; anyone who
// can manage team members can add them for anyone.
const KINDS = {
  qualification: { types: "qualifications", held: "member_qualifications", column: "qualification_id", label: "Qualification" },
  certification: { types: "certifications", held: "member_certifications", column: "certification_id", label: "Certification" },
} as const;

export type CredentialKind = keyof typeof KINDS;

function kindOf(formData: FormData) {
  return KINDS[formData.get("kind") === "certification" ? "certification" : "qualification"];
}

// Only same-site paths, so a form can't send people elsewhere.
function returnPath(formData: FormData) {
  const path = String(formData.get("return_to") ?? "/profile");
  return path.startsWith("/") && !path.startsWith("//") ? path : "/profile";
}

async function allowedFor(profileId: string) {
  const user = await getCurrentUser();
  return user.active && (profileId === user.id || user.can("manage_members"));
}

export async function addCredential(formData: FormData) {
  const kind = kindOf(formData);
  const back = returnPath(formData);
  const profileId = String(formData.get("profile_id"));
  if (!(await allowedFor(profileId))) finish(back, { message: "You can only change your own record." });

  const itemId = String(formData.get("item_id"));
  const earnedOn = String(formData.get("earned_on"));
  const supabase = await createClient();

  // Work out the expiry date from how long it lasts unless one was given.
  let expiresOn = text(formData, "expires_on");
  if (!expiresOn) {
    const { data: item } = await supabase.from(kind.types).select("valid_months").eq("id", itemId).single();
    if (item?.valid_months) {
      const date = new Date(`${earnedOn}T00:00:00Z`);
      date.setUTCMonth(date.getUTCMonth() + item.valid_months);
      expiresOn = date.toISOString().slice(0, 10);
    }
  }

  const { error } = await supabase.from(kind.held).upsert(
    { profile_id: profileId, [kind.column]: itemId, earned_on: earnedOn, expires_on: expiresOn },
    { onConflict: `profile_id,${kind.column}` },
  );
  revalidatePath("/", "layout");
  finish(back, error, `${kind.label} added.`);
}

export async function removeCredential(formData: FormData) {
  const kind = kindOf(formData);
  const back = returnPath(formData);
  const profileId = String(formData.get("profile_id"));
  if (!(await allowedFor(profileId))) finish(back, { message: "You can only change your own record." });

  const supabase = await createClient();
  const { error } = await supabase
    .from(kind.held)
    .delete()
    .eq("id", String(formData.get("held_id")))
    .eq("profile_id", profileId);
  revalidatePath("/", "layout");
  finish(back, error, `${kind.label} removed.`);
}
