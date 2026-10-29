"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { saveProgress, type SavedProgress } from "@/app/(app)/training/actions";
import { youTubeEmbedUrl, type TrainingLesson } from "@/lib/training";

/** A practice question inside a lesson: instant feedback, not graded. */
function KnowledgeCheck({ lesson }: { lesson: TrainingLesson }) {
  const [picked, setPicked] = useState<number | null>(null);
  if (!lesson.check_prompt || !lesson.check_choices?.length) return null;
  const answered = picked !== null;
  const right = picked === lesson.check_answer;

  return (
    <div className="mt-5 rounded-lg border border-blue-300 bg-blue-50 p-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-800">Check your understanding</p>
      <p className="mb-3 font-medium">{lesson.check_prompt}</p>
      <div className="space-y-2">
        {lesson.check_choices.map((choice, i) => {
          const style =
            i === picked
              ? right
                ? "border-green-700 bg-green-50"
                : "border-red-600 bg-red-50"
              : right
                ? "border-slate-200 bg-white opacity-70"
                : "border-slate-300 bg-white hover:border-blue-400";
          return (
            <button
              key={i}
              type="button"
              disabled={right}
              onClick={() => setPicked(i)}
              className={`block w-full rounded-md border px-3 py-2 text-left ${style}`}
            >
              {choice}
              {i === picked && right && <span className="ml-2 text-sm font-medium text-green-700">✓</span>}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-3 text-sm" role="status">
          {right ? (
            <>
              <p className="font-semibold text-green-700">That&apos;s right.</p>
              {lesson.check_explanation && <p className="mt-1 text-slate-700">{lesson.check_explanation}</p>}
            </>
          ) : (
            <p className="font-semibold text-red-700">Not quite. Think about it again and pick another answer.</p>
          )}
        </div>
      )}
    </div>
  );
}

function Video({ url }: { url: string }) {
  const embed = youTubeEmbedUrl(url);
  if (!embed) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-blue-700 underline">
        Watch the video
      </a>
    );
  }
  return (
    <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg bg-black">
      <iframe
        src={embed}
        title="Lesson video"
        className="h-full w-full"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        loading="lazy"
      />
    </div>
  );
}

/** What the narrator reads for a slide: the title, then the lesson text without formatting marks. */
function spokenText(lesson: TrainingLesson) {
  const body = lesson.body
    .split("\n")
    .map((line) => line.trim().replace(/^- /, "").replace(/\*\*/g, ""))
    .filter(Boolean)
    .map((line) => (/[.!?:"]$/.test(line) ? line : `${line}.`))
    .join(" ");
  return `${lesson.title}. ${body}`;
}

/** About how long reading the text aloud takes, at roughly 160 words a minute. */
function readingMs(text: string) {
  return Math.max(3000, (text.split(/\s+/).length / 160) * 60_000);
}

const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;

/**
 * The lessons as slides, one at a time, read aloud. Next unlocks once the
 * reading is done; muting stops the voice but keeps the same reading time.
 * Slides already read can be revisited freely. The quiz (passed in as
 * `quiz`) appears after the last slide.
 */
export function LessonSlides({
  lessons,
  slide: lessonBody,
  quiz,
  canSkip = false,
  classId,
  saved,
}: {
  lessons: TrainingLesson[];
  /** Each lesson's rendered text, by lesson id. */
  slide: Record<string, ReactNode>;
  quiz: ReactNode;
  /** Admins reviewing a class don't have to wait for the reading. */
  canSkip?: boolean;
  classId: string;
  /** Where this member left off last time, if anywhere. */
  saved: Pick<SavedProgress, "done_through" | "current_slide"> | null;
}) {
  const total = lessons.length;
  const [started, setStarted] = useState(false);
  const resumeAt = saved ? Math.min(saved.current_slide, total) : 0;
  const [index, setIndex] = useState(resumeAt);
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  // Highest slide whose reading has finished (-1 = none yet).
  const [doneThrough, setDoneThrough] = useState(saved ? Math.min(saved.done_through, total - 1) : -1);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mutedRef = useRef(muted);
  // Bumped whenever reading stops, so a cancelled voice's late "ended" event is ignored.
  const generation = useRef(0);
  mutedRef.current = muted;

  const onQuiz = index >= total;
  const lesson = lessons[index];
  const slideDone = canSkip || index <= doneThrough;

  const stop = useCallback(() => {
    generation.current += 1;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (canSpeak()) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const finish = useCallback(
    (i: number) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      setSpeaking(false);
      setDoneThrough((d) => Math.max(d, i));
    },
    [],
  );

  /** Reads slide i aloud (or just waits its reading time when muted). */
  const read = useCallback(
    (i: number, mustWait: boolean) => {
      stop();
      const l = lessons[i];
      if (!l) return;
      const text = spokenText(l);
      const ms = readingMs(text);
      startedAt.current = Date.now();
      if (mutedRef.current || !canSpeak()) {
        if (mustWait) timer.current = setTimeout(() => finish(i), ms);
        return;
      }
      // One utterance per sentence: long single utterances can stall in some browsers.
      const sentences = text.match(/[^.!?]+[.!?]+["']?|\S[^.!?]*$/g) ?? [text];
      const mine = generation.current;
      sentences.forEach((sentence, n) => {
        const u = new SpeechSynthesisUtterance(sentence.trim());
        u.rate = 1;
        if (n === sentences.length - 1) u.onend = () => generation.current === mine && finish(i);
        window.speechSynthesis.speak(u);
      });
      setSpeaking(true);
      // Safety net in case the browser never reports the end of speech.
      timer.current = setTimeout(() => finish(i), ms * 1.8 + 5000);
    },
    [lessons, stop, finish],
  );

  // Read each slide when it comes up, unless it was already read.
  useEffect(() => {
    if (!started || onQuiz) return;
    if (index > doneThrough) read(index, true);
    else stop();
  }, [started, index, onQuiz]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => stop, [stop]);

  // Save their place as they go, so closing the app or stepping away resumes here.
  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => {
      saveProgress(classId, { done_through: doneThrough, current_slide: index }).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [started, classId, doneThrough, index]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    mutedRef.current = next;
    if (next && speaking && !slideDone) {
      // Stop the voice but keep the rest of the reading time.
      const l = lessons[index];
      const remaining = readingMs(spokenText(l)) - (Date.now() - startedAt.current);
      stop();
      timer.current = setTimeout(() => finish(index), Math.max(0, remaining));
    } else if (next) {
      stop();
    }
  };

  const go = (next: number) => {
    stop();
    setIndex(next);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const seenAll = canSkip || doneThrough >= total - 1;

  if (!started && total > 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="mb-1 text-lg font-semibold">{total} slides, then the quiz</p>
        {saved && (resumeAt > 0 || saved.done_through >= 0) && (
          <p className="mb-2 text-sm font-medium text-blue-800">
            Welcome back. You&apos;ll pick up {resumeAt >= total ? "at the quiz" : `on slide ${resumeAt + 1}`}.
          </p>
        )}
        <p className="mb-4 text-sm text-slate-600">
          Each slide is read aloud. Turn your sound on, or use the mute button and read along. The Next button unlocks
          when the reading is done.
        </p>
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="rounded-md bg-blue-700 px-5 py-2.5 font-medium text-onaccent hover:brightness-90"
        >
          ▶ {saved && (resumeAt > 0 || saved.done_through >= 0) ? "Continue the class" : "Start the class"}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Progress: one step per lesson, then the quiz. Only slides already read can be jumped to. */}
      <ol className="mb-4 flex flex-wrap items-center gap-2" aria-label="Class progress">
        {lessons.map((l, i) => {
          const reachable = canSkip || i <= doneThrough + 1;
          return (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => reachable && go(i)}
                disabled={!reachable}
                aria-current={i === index ? "step" : undefined}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  i === index ? "bg-blue-700 text-onaccent" : i <= doneThrough ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-500"
                }`}
              >
                {i + 1}
              </button>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() => seenAll && go(total)}
            disabled={!seenAll}
            aria-current={onQuiz ? "step" : undefined}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              onQuiz ? "bg-blue-700 text-onaccent" : seenAll ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-500"
            }`}
          >
            Quiz
          </button>
        </li>
      </ol>

      {onQuiz ? (
        quiz
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Slide {index + 1} of {total}
            </p>
            <div className="flex items-center gap-2">
              {slideDone && !muted && canSpeak() && (
                <button
                  type="button"
                  onClick={() => read(index, false)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-50"
                >
                  ↻ Read again
                </button>
              )}
              <button
                type="button"
                onClick={toggleMute}
                aria-pressed={muted}
                className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-50"
              >
                {muted ? "🔇 Unmute" : "🔊 Mute"}
              </button>
            </div>
          </div>
          <h2 className="mb-4 text-xl font-semibold">{lesson.title}</h2>
          <div className="text-lg">{lessonBody[lesson.id]}</div>
          {lesson.video_url && <Video url={lesson.video_url} />}
          <KnowledgeCheck key={lesson.id} lesson={lesson} />
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => go(index - 1)}
              disabled={index === 0}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-40"
            >
              ← Back
            </button>
            <div className="flex items-center gap-3">
              {!slideDone && (
                <span className="text-sm text-slate-500" role="status">
                  {speaking ? "Reading…" : "Take a moment to read…"}
                </span>
              )}
              <button
                type="button"
                onClick={() => go(index + 1)}
                disabled={!slideDone}
                className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-onaccent hover:brightness-90 disabled:opacity-40"
              >
                {index + 1 === total ? "Go to the quiz →" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
