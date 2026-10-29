"use server";

import { createClient } from "@/lib/supabase/server";

export type SavedProgress = {
  done_through: number;
  current_slide: number;
  quiz_answers: Record<string, number>;
};

/** Saves where a member is in a class. Called by the slides as they go. */
export async function saveProgress(classId: string, progress: Partial<SavedProgress>) {
  const supabase = await createClient();
  // Never redirect from a background save; just skip it if signed out.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("training_progress")
    .upsert(
      { profile_id: user.id, class_id: classId, ...progress, updated_at: new Date().toISOString() },
      { onConflict: "profile_id,class_id" },
    );
}
