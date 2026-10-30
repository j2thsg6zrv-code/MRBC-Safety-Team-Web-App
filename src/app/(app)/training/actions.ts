"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { canCreatePictures, createPicture } from "@/lib/slidePictures";
import { createClient } from "@/lib/supabase/server";
import { PICTURE_BUCKET } from "@/lib/training";

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

/**
 * Creates an AI picture for one lesson and puts it on the slide, replacing
 * any picture it had. `note` says what to change when regenerating. Admins only. Called one slide at a time by the class
 * editor, since each picture takes a while to make.
 */
export async function createLessonPicture(lessonId: string, note = ""): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user.isAdmin) return { error: "Only admins can create pictures." };
  if (!canCreatePictures()) return { error: "Picture creation isn't set up yet: add ANTHROPIC_API_KEY or OPENAI_API_KEY in Vercel." };
  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("training_lessons")
    .select("id, class_id, title, body, image_path, position")
    .eq("id", lessonId)
    .single();
  if (!lesson) return { error: "That lesson no longer exists." };
  // Up to three pictures already in the class, nearest slides first, so new ones match them.
  const { data: others } = await supabase
    .from("training_lessons")
    .select("image_path, position")
    .eq("class_id", lesson.class_id)
    .neq("id", lessonId)
    .not("image_path", "is", null);
  const examples = (others ?? [])
    .sort((a, b) => Math.abs(a.position - lesson.position) - Math.abs(b.position - lesson.position))
    .slice(0, 3)
    .map((l) => l.image_path as string);
  const picture = await createPicture(supabase, lesson, examples, note.trim().slice(0, 300));
  if (picture.error || !picture.path) return { error: picture.error?.message ?? "Couldn't save the picture." };
  const { error } = await supabase.from("training_lessons").update({ image_path: picture.path }).eq("id", lessonId);
  if (error) return { error: error.message };
  if (lesson.image_path) await supabase.storage.from(PICTURE_BUCKET).remove([lesson.image_path]);
  revalidatePath(`/training/manage/${lesson.class_id}`);
  revalidatePath(`/training/${lesson.class_id}`);
  return {};
}
