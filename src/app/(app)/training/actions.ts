"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { canWriteClasses, WORDS_PER_MINUTE, writeSlide, writeTest } from "@/lib/classWriter";
import { canCreatePictures, createPicture } from "@/lib/slidePictures";
import { createClient } from "@/lib/supabase/server";
import { PICTURE_BUCKET, PICTURE_PATH } from "@/lib/training";

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

/** Makes an AI picture for a lesson and saves it to storage, without putting it on the slide yet. */
async function makeLessonPicture(lessonId: string, note: string) {
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
  // Pictures already saved, so new ones match them: up to three from this class (nearest slides first)
  // and one from each other class, up to six. More would slow each picture past the time limit.
  const { data: saved } = await supabase
    .from("training_lessons")
    .select("class_id, image_path, position")
    .neq("id", lessonId)
    .not("image_path", "is", null);
  const sameClass = (saved ?? [])
    .filter((l) => l.class_id === lesson.class_id)
    .sort((a, b) => Math.abs(a.position - lesson.position) - Math.abs(b.position - lesson.position))
    .slice(0, 3);
  const otherClasses = new Map<string, string>();
  for (const l of saved ?? []) {
    if (l.class_id !== lesson.class_id && !otherClasses.has(l.class_id)) otherClasses.set(l.class_id, l.image_path as string);
  }
  const examples = [...sameClass.map((l) => l.image_path as string), ...[...otherClasses.values()].slice(0, 6)];
  const picture = await createPicture(supabase, lesson, examples, note.trim().slice(0, 300));
  if (picture.error || !picture.path) return { error: picture.error?.message ?? "Couldn't save the picture." };
  return { path: picture.path };
}

/**
 * Creates an AI picture for one lesson and puts it on the slide, replacing
 * any picture it had. Admins only. Called one slide at a time by "Create
 * pictures" in the class editor, since each picture takes a while to make.
 */
export async function createLessonPicture(lessonId: string): Promise<{ error?: string }> {
  const made = await makeLessonPicture(lessonId, "");
  if (!made.path) return { error: made.error };
  return applyLessonPicture(lessonId, made.path);
}

/**
 * Creates an AI picture for one lesson for the admin to look at first.
 * `note` says what to change when regenerating. Nothing changes on the slide
 * until applyLessonPicture; discardLessonPicture throws the picture away.
 */
export async function previewLessonPicture(
  lessonId: string,
  note = "",
): Promise<{ error?: string; path?: string; url?: string }> {
  const made = await makeLessonPicture(lessonId, note);
  if (!made.path) return { error: made.error };
  const supabase = await createClient();
  const { data } = await supabase.storage.from(PICTURE_BUCKET).createSignedUrl(made.path, 60 * 60);
  if (!data) return { error: "The picture was made but couldn't be shown." };
  return { path: made.path, url: data.signedUrl };
}

/** Puts a previewed picture on the slide, replacing any picture it had. Admins only. */
export async function applyLessonPicture(lessonId: string, path: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user.isAdmin) return { error: "Only admins can change pictures." };
  if (!PICTURE_PATH.test(path)) return { error: "That isn't a picture from this app." };
  const supabase = await createClient();
  const { data: lesson } = await supabase.from("training_lessons").select("class_id, image_path").eq("id", lessonId).single();
  if (!lesson) return { error: "That lesson no longer exists." };
  const { error } = await supabase.from("training_lessons").update({ image_path: path }).eq("id", lessonId);
  if (error) return { error: error.message };
  if (lesson.image_path && lesson.image_path !== path) await supabase.storage.from(PICTURE_BUCKET).remove([lesson.image_path]);
  revalidatePath(`/training/manage/${lesson.class_id}`);
  revalidatePath(`/training/${lesson.class_id}`);
  return {};
}

/** Throws away a previewed picture the admin didn't want. Admins only. */
export async function discardLessonPicture(path: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user.isAdmin || !PICTURE_PATH.test(path)) return;
  const supabase = await createClient();
  // Never remove a picture that a slide is using.
  const { data: inUse } = await supabase.from("training_lessons").select("id").eq("image_path", path).limit(1);
  if (inUse?.length) return;
  await supabase.storage.from(PICTURE_BUCKET).remove([path]);
}

const NO_WRITER = "Writing classes isn't set up yet: add ANTHROPIC_API_KEY in Vercel.";

/**
 * Has Claude write one slide's title, reader script, and check question,
 * replacing what the slide had. `minutes` is the whole class's length, shared
 * across its slides. Admins only. Called one slide at a time by "Write the
 * class" in the class editor.
 */
export async function writeLessonScript(lessonId: string, minutes: number): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user.isAdmin) return { error: "Only admins can write classes." };
  if (!canWriteClasses()) return { error: NO_WRITER };
  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("training_lessons")
    .select("id, class_id, title, body, image_path")
    .eq("id", lessonId)
    .single();
  if (!lesson) return { error: "That lesson no longer exists." };
  const [{ data: cls }, { data: all }] = await Promise.all([
    supabase.from("training_classes").select("title").eq("id", lesson.class_id).single(),
    supabase.from("training_lessons").select("id, title").eq("class_id", lesson.class_id).order("position").order("created_at"),
  ]);
  const outline = (all ?? []).map((l) => l.title as string);
  const index = (all ?? []).findIndex((l) => l.id === lessonId);
  const words = Math.max(40, Math.round((Math.max(5, minutes) * WORDS_PER_MINUTE) / Math.max(1, outline.length)));
  try {
    const written = await writeSlide(supabase, { classTitle: cls?.title ?? "", outline, lesson, index, words });
    const check = written.check.prompt ? written.check : null;
    const { error } = await supabase
      .from("training_lessons")
      .update({
        title: written.title,
        body: written.script,
        check_prompt: check?.prompt ?? null,
        check_choices: check?.choices ?? null,
        check_answer: check?.answer ?? null,
        check_explanation: check?.explanation || null,
      })
      .eq("id", lessonId);
    if (error) return { error: error.message };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't write this slide." };
  }
  return {};
}

/**
 * Has Claude write the class's 10-question final test from its slides,
 * replacing any test it had, and sets the class length. Admins only.
 */
export async function writeClassTest(classId: string, minutes: number): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user.isAdmin) return { error: "Only admins can write classes." };
  if (!canWriteClasses()) return { error: NO_WRITER };
  const supabase = await createClient();
  const [{ data: cls }, { data: lessons }] = await Promise.all([
    supabase.from("training_classes").select("title").eq("id", classId).single(),
    supabase.from("training_lessons").select("title, body").eq("class_id", classId).order("position").order("created_at"),
  ]);
  if (!cls) return { error: "That class no longer exists." };
  let questions;
  try {
    questions = await writeTest(cls.title, lessons ?? []);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't write the test." };
  }
  // Answers are removed with their questions.
  const { error: deleteError } = await supabase.from("training_questions").delete().eq("class_id", classId);
  if (deleteError) return { error: deleteError.message };
  const { data: saved, error } = await supabase
    .from("training_questions")
    .insert(questions.map((q, i) => ({ class_id: classId, position: i + 1, prompt: q.prompt, choices: q.choices })))
    .select("id, position");
  if (error || !saved) return { error: error?.message ?? "Couldn't save the test." };
  const { error: answerError } = await supabase
    .from("training_answers")
    .insert(saved.map((s) => ({ question_id: s.id, correct_index: questions[s.position - 1].answer })));
  if (answerError) return { error: answerError.message };
  await supabase.from("training_classes").update({ minutes: Math.round(minutes) }).eq("id", classId);
  revalidatePath(`/training/manage/${classId}`);
  revalidatePath(`/training/${classId}`);
  return {};
}
