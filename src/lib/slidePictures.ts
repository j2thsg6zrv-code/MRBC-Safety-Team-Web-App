import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PICTURE_BUCKET, type TrainingLesson } from "@/lib/training";

// Two ways to make pictures: OpenAI paints a cartoon, or Claude draws a flat
// illustration as an SVG. An Anthropic key saved as OPENAI_API_KEY counts as
// an Anthropic key, so either name works for it.
function keys() {
  const openai = process.env.OPENAI_API_KEY?.trim();
  const isAnthropicKey = openai?.startsWith("sk-ant-");
  return {
    openai: isAnthropicKey ? undefined : openai,
    anthropic: process.env.ANTHROPIC_API_KEY?.trim() || (isAnthropicKey ? openai : undefined),
  };
}

/** Whether the app can create pictures: an OpenAI or Anthropic API key is set on the server. */
export const canCreatePictures = () => {
  const k = keys();
  return !!(k.openai || k.anthropic);
};

// The same look for every slide, so a class feels like one set of pictures.
const STYLE =
  "A clean, realistic-style illustration, not a cartoon: natural proportions, muted true-to-life colors, " +
  "simple flat shading, like a figure in a professional safety training manual. It shows exactly what the " +
  "slide's text describes, such as the scene, the steps, or the equipment it talks about. " +
  "Calm and respectful: no blood, injuries, or frightening scenes, and no logos or real people.";

function about(lesson: Pick<TrainingLesson, "title" | "body">) {
  // The whole slide, so the picture matches what it actually teaches.
  const text = lesson.body.replace(/\*\*/g, "").replace(/\s+/g, " ").slice(0, 2500);
  return `Slide title: "${lesson.title}"\nSlide text: ${text}`;
}

/** Saves a picture to storage and returns its path. */
export async function savePicture(supabase: SupabaseClient, data: Blob, contentType: string) {
  const ext = contentType === "image/svg+xml" ? "svg" : contentType.split("/")[1]?.replace("jpeg", "jpg") || "png";
  const path = `slides/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(PICTURE_BUCKET).upload(path, data, { contentType });
  return { path: error ? null : path, error };
}

/**
 * Makes a picture that fits the slide, and saves it. Uses OpenAI when its key
 * is set, otherwise Claude. Claude also looks at `examples`, pictures already
 * in the class, and matches their look.
 */
export async function createPicture(
  supabase: SupabaseClient,
  lesson: Pick<TrainingLesson, "title" | "body">,
  examples: string[] = [],
) {
  const k = keys();
  if (k.openai) return paintWithOpenAI(supabase, lesson, k.openai);
  if (k.anthropic) return drawWithClaude(supabase, lesson, k.anthropic, examples);
  return { path: null, error: { message: "Couldn't create a picture: no API key is set." } };
}

async function paintWithOpenAI(supabase: SupabaseClient, lesson: Pick<TrainingLesson, "title" | "body">, key: string) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
      prompt: `${STYLE} No words or letters.\n\n${about(lesson)}`,
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

const DRAWING_RULES =
  "You draw illustrations for church safety team training slides as SVG code. Read the slide and pick the one " +
  "picture that best shows what it teaches: a scene of the situation, a step-by-step diagram, or a simple visual " +
  "of the key points. Reply with only one complete <svg> element and nothing else: " +
  'viewBox="0 0 1200 800", no width or height attributes, a full-bleed background, and only basic shapes, ' +
  "paths, gradients, groups and <text>. Short labels (a few words each) are fine where they help; no sentences. " +
  "No <script>, <foreignObject>, <image>, event attributes, links, or external references.";

const PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;

/** Loads the class's existing pictures so Claude can see them: photos as images, drawings as their SVG code. */
async function exampleBlocks(supabase: SupabaseClient, paths: string[]) {
  const blocks: Anthropic.ContentBlockParam[] = [];
  for (const path of paths) {
    const { data } = await supabase.storage.from(PICTURE_BUCKET).download(path);
    if (!data) continue;
    const type = data.type || (path.endsWith(".svg") ? "image/svg+xml" : "");
    const photoType = PHOTO_TYPES.find((t) => t === type);
    if (photoType && data.size < 4_000_000) {
      const b64 = Buffer.from(await data.arrayBuffer()).toString("base64");
      blocks.push({ type: "image", source: { type: "base64", media_type: photoType, data: b64 } });
    } else if (type === "image/svg+xml") {
      const svg = await data.text();
      // Long drawings only need their opening to show the palette and style.
      blocks.push({ type: "text", text: `Picture from this class (SVG):\n${svg.slice(0, 12000)}` });
    }
  }
  if (blocks.length) {
    blocks.unshift({
      type: "text",
      text:
        "These pictures are already in this class. Use them as inspiration: match their look, colors, " +
        "level of detail and kind of picture so the new one fits with them, but draw this slide's own content.",
    });
  }
  return blocks;
}

async function drawWithClaude(
  supabase: SupabaseClient,
  lesson: Pick<TrainingLesson, "title" | "body">,
  key: string,
  examples: string[],
) {
  const client = new Anthropic({ apiKey: key });
  const references = await exampleBlocks(supabase, examples);
  let svg = "";
  try {
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_IMAGE_MODEL || "claude-opus-5-5",
      max_tokens: 16000,
      // Low effort keeps each drawing well inside the page's time limit.
      output_config: { effort: "low" },
      system: DRAWING_RULES,
      messages: [{ role: "user", content: [...references, { type: "text", text: `${STYLE}\n\n${about(lesson)}` }] }],
    });
    if (response.stop_reason === "refusal") {
      return { path: null, error: { message: "Couldn't create a picture: Claude declined to draw this slide." } };
    }
    for (const block of response.content) if (block.type === "text") svg += block.text;
  } catch (e) {
    const reason =
      e instanceof Anthropic.AuthenticationError
        ? "the Anthropic API key isn't valid."
        : e instanceof Anthropic.APIError
          ? e.message
          : "the request failed.";
    return { path: null, error: { message: `Couldn't create a picture: ${reason}` } };
  }
  const clean = cleanSvg(svg);
  if (!clean) return { path: null, error: { message: "Couldn't create a picture: the drawing came back incomplete." } };
  return savePicture(supabase, new Blob([clean], { type: "image/svg+xml" }), "image/svg+xml");
}

/** Keeps just the <svg> element and strips anything that could run or load other content. */
function cleanSvg(text: string) {
  const start = text.indexOf("<svg");
  const end = text.lastIndexOf("</svg>");
  if (start < 0 || end < start) return null;
  let svg = text.slice(start, end + 6);
  svg = svg.replace(/<(script|foreignObject|image|a)\b[\s\S]*?<\/\1\s*>/gi, "").replace(/<(script|foreignObject|image|a)\b[^>]*\/?>/gi, "");
  svg = svg.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, "").replace(/(href|xlink:href)\s*=\s*("(?!#)[^"]*"|'(?!#)[^']*')/gi, "");
  if (!/xmlns=/.test(svg.slice(0, 200))) svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  return svg;
}
