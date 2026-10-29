import type { SupabaseClient } from "@supabase/supabase-js";
import { PICTURE_BUCKET, type TrainingLesson } from "@/lib/training";

/** Whether the app can create pictures: an OpenAI API key is set on the server. */
export const canCreatePictures = () => !!process.env.OPENAI_API_KEY;

// The same look for every slide, so a class feels like one set of pictures.
const STYLE =
  "A friendly, simple flat cartoon illustration with soft warm colors and clean shapes, " +
  "in the style of a church volunteer training booklet. Diverse, kind-looking adults in everyday clothes " +
  "at a small church. Calm and reassuring: no weapons, blood, injuries, fire damage or frightening scenes. " +
  "No words, letters, signs with writing, logos, or real people.";

function prompt(lesson: Pick<TrainingLesson, "title" | "body">) {
  // The title and the start of the text say what the slide is about.
  const about = lesson.body.replace(/\*\*/g, "").replace(/^- /gm, "").replace(/\s+/g, " ").slice(0, 400);
  return `${STYLE}\n\nThe picture illustrates a training slide titled "${lesson.title}". The slide says: ${about}`;
}

/** Saves a picture to storage and returns its path. */
export async function savePicture(supabase: SupabaseClient, data: Blob, contentType: string) {
  const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") || "png";
  const path = `slides/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(PICTURE_BUCKET).upload(path, data, { contentType });
  return { path: error ? null : path, error };
}

/** Asks OpenAI for a picture that fits the slide, and saves it. */
export async function createPicture(supabase: SupabaseClient, lesson: Pick<TrainingLesson, "title" | "body">) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
      prompt: prompt(lesson),
      size: "1536x1024",
      quality: "medium",
      output_format: "webp",
      n: 1,
    }),
  });
  const json = await res.json().catch(() => null);
  const b64: string | undefined = json?.data?.[0]?.b64_json;
  if (!res.ok || !b64) {
    const reason = json?.error?.message ?? `The image service answered ${res.status}.`;
    return { path: null, error: { message: `Couldn't create a picture: ${reason}` } };
  }
  return savePicture(supabase, new Blob([Buffer.from(b64, "base64")], { type: "image/webp" }), "image/webp");
}
