"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createLessonPicture } from "@/app/(app)/training/actions";

/**
 * Creates AI pictures for every slide in a class that doesn't have one, one
 * slide at a time, showing progress. Each picture takes up to two minutes.
 */
export function CreateAllPictures({ lessonIds }: { lessonIds: string[] }) {
  const router = useRouter();
  const [done, setDone] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  if (lessonIds.length === 0) return <p className="text-sm text-slate-600">Every slide has a picture.</p>;

  const run = async () => {
    setErrors([]);
    for (let i = 0; i < lessonIds.length; i++) {
      setDone(i);
      const result = await createLessonPicture(lessonIds[i]).catch(() => ({ error: "The request failed." }));
      if (result.error) setErrors((e) => [...e, `Slide ${i + 1}: ${result.error}`]);
    }
    setDone(lessonIds.length);
    router.refresh();
  };

  const running = done !== null && done < lessonIds.length;
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={run}
        disabled={running}
        className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-onaccent hover:brightness-90 disabled:opacity-50"
      >
        {running
          ? `Creating picture ${done + 1} of ${lessonIds.length}…`
          : `Create pictures for ${lessonIds.length} slide${lessonIds.length === 1 ? "" : "s"} without one`}
      </button>
      {running && <p className="text-sm text-slate-600">Keep this page open. Each picture takes up to two minutes.</p>}
      {errors.length > 0 && (
        <ul className="list-disc pl-5 text-sm text-red-700">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Makes a new AI picture for one slide. When the slide already has one, this
 * regenerates it, optionally with a note on what to change.
 */
export function NewPictureButton({ lessonId, hasPicture }: { lessonId: string; hasPicture: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const run = async () => {
    setBusy(true);
    setError("");
    const result = await createLessonPicture(lessonId, note).catch(() => ({ error: "The request failed." }));
    setBusy(false);
    if (result.error) setError(result.error);
    else {
      setNote("");
      router.refresh();
    }
  };
  return (
    <span className="grid gap-2">
      {hasPicture && (
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          // This sits inside the lesson form; Enter should regenerate, not save the lesson.
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (!busy) run();
            }
          }}
          maxLength={300}
          placeholder="Optional: what should be different?"
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      )}
      <span className="inline-flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={run}
          disabled={busy}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
        >
          {busy ? "Creating… (up to two minutes)" : hasPicture ? "🔄 Regenerate picture" : "✨ Create AI picture"}
        </button>
        {error && <span className="text-sm text-red-700">{error}</span>}
      </span>
    </span>
  );
}
