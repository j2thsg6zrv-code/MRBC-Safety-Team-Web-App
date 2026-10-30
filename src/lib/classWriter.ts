import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import { anthropicKey } from "@/lib/slidePictures";
import { PICTURE_BUCKET, type TrainingLesson } from "@/lib/training";

// Claude turns an imported PowerPoint into a class: for each slide a title, a
// script the reader reads aloud, and a check-for-understanding question, then a
// final test. It reads each slide's picture and looks facts up on the web, the
// way the De-escalation and Child Safety classes were written by hand.

/** Words read aloud per minute, used to size the scripts to the class length. */
export const WORDS_PER_MINUTE = 130;

export const canWriteClasses = () => !!anthropicKey();

const MODEL = () => process.env.ANTHROPIC_WRITER_MODEL || "claude-opus-5-5";

const WRITING_RULES = `You write training classes for a church safety team (volunteers who greet, watch doors, and keep the congregation safe). Each class is a set of slides. A reader reads each slide's script aloud to the team while the slide's picture is shown.

For the slide you're given:
- Read the slide's picture and text carefully. The script must teach what the slide shows, in the same order, and must not contradict it.
- Use web search to check facts, statistics, laws, and sources the slide mentions, and to add accurate, useful background a trainer would add. Prefer government, legal, and well-known professional sources. Never invent statistics, quotes, or laws. If you can't confirm something on the slide, leave it out or say it gently ("one study found…").
- The church is in Texas (US Central time). When state law matters, use Texas law and say "In Texas".
- Write the script as plain spoken English for one person to read aloud: warm, clear, short sentences, speaking to the team as "we" and "you". No headings. Separate paragraphs with a single newline. Bullet points start with "- " on their own line; use them only for lists that are on the slide. **Bold** is allowed for key terms. Scripture quotes are welcome when the slide has one.
- Don't greet the class or wrap up the whole class unless this is the first or last slide.
- Write one multiple-choice check-for-understanding question about this slide. Prefer a short real situation ("A visitor without a tag asks…"). Exactly 3 choices, one clearly correct, wrong ones plausible but clearly wrong to someone who listened. Vary which position is correct. Add a one or two sentence explanation shown after answering.

Reply with only a JSON object, no other text:
{"title": "short slide title, 2-6 words", "script": "…", "check": {"prompt": "…", "choices": ["…", "…", "…"], "answer": 0, "explanation": "…"}}`;

const TEST_RULES = `You write the final test for a church safety team training class. You get every slide's title and script. Write exactly 10 multiple-choice questions that cover the most important points across the whole class, in the order they were taught. Prefer short real situations over trivia. Each question has exactly 4 choices with one clearly correct answer; vary which position is correct. Don't repeat the slide check questions word for word.

Reply with only a JSON object, no other text:
{"questions": [{"prompt": "…", "choices": ["…", "…", "…", "…"], "answer": 0}]}`;

export type WrittenSlide = {
  title: string;
  script: string;
  check: { prompt: string; choices: string[]; answer: number; explanation: string };
};
export type TestQuestion = { prompt: string; choices: string[]; answer: number };

const PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;

/** The slide's picture as an image Claude can read, when it's a photo small enough to send. */
async function pictureBlock(supabase: SupabaseClient, path: string | null): Promise<Anthropic.Beta.BetaContentBlockParam[]> {
  if (!path) return [];
  const { data } = await supabase.storage.from(PICTURE_BUCKET).download(path);
  const type = PHOTO_TYPES.find((t) => t === data?.type);
  if (!data || !type || data.size > 4_000_000) return [];
  const b64 = Buffer.from(await data.arrayBuffer()).toString("base64");
  return [{ type: "image", source: { type: "base64", media_type: type, data: b64 } }];
}

/** Sends one request, resuming when the web search loop pauses, and returns the reply's text. */
async function ask(system: string, content: Anthropic.Beta.BetaContentBlockParam[], search: boolean) {
  const client = new Anthropic({ apiKey: anthropicKey() });
  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content }];
  for (let turn = 0; turn < 4; turn++) {
    const response = await client.beta.messages
      .stream({
        model: MODEL(),
        max_tokens: 16000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "medium" },
        system,
        tools: search ? [{ type: "web_search_20260209", name: "web_search", max_uses: 3 }] : undefined,
        messages,
      })
      .finalMessage();
    if (response.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: response.content });
      continue;
    }
    if (response.stop_reason === "refusal") throw new Error("Claude declined to write this part.");
    return response.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  }
  throw new Error("The research took too long. Try again.");
}

function parseJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("The reply came back incomplete. Try again.");
  return JSON.parse(text.slice(start, end + 1));
}

const clean = (s: unknown) => String(s ?? "").trim();

/** Writes one slide's title, script, and check question. */
export async function writeSlide(
  supabase: SupabaseClient,
  opts: {
    classTitle: string;
    outline: string[];
    lesson: Pick<TrainingLesson, "title" | "body" | "image_path">;
    index: number;
    words: number;
  },
): Promise<WrittenSlide> {
  const { classTitle, outline, lesson, index, words } = opts;
  const where = index === 0 ? " This is the first slide, so open the class briefly." : index === outline.length - 1 ? " This is the last slide, so close the class briefly." : "";
  const request =
    `Class: ${classTitle}\n` +
    `All slides, in order:\n${outline.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\n` +
    `Write slide ${index + 1} of ${outline.length}.${where}\n` +
    `Its current title: ${lesson.title}\n` +
    `Its text (may be empty if the slide is only a picture):\n${lesson.body || "(none)"}\n\n` +
    `Aim for about ${words} words in the script (shorter for a title or section slide, longer for a slide full of content).`;
  const reply = parseJson(
    await ask(WRITING_RULES, [...(await pictureBlock(supabase, lesson.image_path)), { type: "text", text: request }], true),
  );
  const choices: string[] = Array.isArray(reply.check?.choices) ? reply.check.choices.map(clean).filter(Boolean) : [];
  const answer = Number(reply.check?.answer);
  const script = clean(reply.script);
  if (!script) throw new Error("The script came back empty. Try again.");
  return {
    title: clean(reply.title).slice(0, 120) || lesson.title,
    script,
    check:
      choices.length >= 2 && choices.length <= 6 && Number.isInteger(answer) && answer >= 0 && answer < choices.length
        ? { prompt: clean(reply.check.prompt), choices, answer, explanation: clean(reply.check.explanation) }
        : { prompt: "", choices: [], answer: 0, explanation: "" },
  };
}

/** Writes the 10-question final test from the finished slides. */
export async function writeTest(classTitle: string, lessons: Pick<TrainingLesson, "title" | "body">[]): Promise<TestQuestion[]> {
  const slides = lessons.map((l, i) => `Slide ${i + 1}: ${l.title}\n${l.body}`).join("\n\n");
  const reply = parseJson(await ask(TEST_RULES, [{ type: "text", text: `Class: ${classTitle}\n\n${slides}` }], false));
  const questions: TestQuestion[] = (Array.isArray(reply.questions) ? reply.questions : [])
    .map((q: { prompt?: unknown; choices?: unknown; answer?: unknown }) => ({
      prompt: clean(q.prompt),
      choices: Array.isArray(q.choices) ? q.choices.map(clean).filter(Boolean) : [],
      answer: Number(q.answer),
    }))
    .filter(
      (q: TestQuestion) =>
        q.prompt && q.choices.length >= 2 && q.choices.length <= 6 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length,
    );
  if (questions.length < 5) throw new Error("The test came back incomplete. Try again.");
  return questions.slice(0, 10);
}
