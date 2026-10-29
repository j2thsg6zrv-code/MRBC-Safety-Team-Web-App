export type TrainingClass = {
  id: string;
  title: string;
  summary: string | null;
  minutes: number | null;
  qualification_id: string | null;
  prerequisite_id: string | null;
  pass_percent: number;
  sort_order: number;
  status: "draft" | "approved";
  approved_at: string | null;
};

export type TrainingLesson = {
  id: string;
  position: number;
  title: string;
  body: string;
  video_url: string | null;
  /** Optional practice question shown on the lesson's slide (not graded). */
  check_prompt: string | null;
  check_choices: string[] | null;
  /** 0 is the first choice. */
  check_answer: number | null;
  check_explanation: string | null;
};

export type TrainingQuestion = {
  id: string;
  position: number;
  prompt: string;
  choices: string[];
};

export type TrainingAttempt = {
  class_id: string;
  correct: number;
  total: number;
  passed: boolean;
  created_at: string;
};

/** Latest pass (or else latest attempt) for each class, from newest-first attempts. */
export function attemptsByClass(attempts: TrainingAttempt[]) {
  const result = new Map<string, TrainingAttempt>();
  for (const a of attempts) {
    const seen = result.get(a.class_id);
    if (!seen || (!seen.passed && a.passed)) result.set(a.class_id, a);
  }
  return result;
}

/** "Choice one\nChoice two" from the admin form, one choice per line. */
export function readChoices(value: string) {
  return value
    .split("\n")
    .map((c) => c.trim())
    .filter(Boolean);
}

/** A timestamp as a short date in the church's time zone, e.g. "Oct 29, 2026". */
export function formatWhen(timestamp: string) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    timeZone: process.env.APP_TIME_ZONE ?? "America/Chicago",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** A privacy-friendly embed address for a YouTube link, or null for any other link. */
export function youTubeEmbedUrl(url: string) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0` : null;
}
