"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  applyLessonPicture,
  createLessonPicture,
  discardLessonPicture,
  previewLessonPicture,
} from "@/app/(app)/training/actions";

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
 * Makes a new AI picture for one slide and shows it large for the admin to
 * approve before it goes on the slide. When the slide already has a picture,
 * this regenerates it, optionally with a note on what to change.
 */
export function NewPictureButton({ lessonId, hasPicture }: { lessonId: string; hasPicture: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState<{ path: string; url: string } | null>(null);

  const make = async () => {
    setBusy(true);
    setError("");
    // Keep showing the last try until the new one is ready.
    const last = preview;
    const result = await previewLessonPicture(lessonId, note).catch(() => ({ error: "The request failed." }) as const);
    setBusy(false);
    if ("path" in result && result.path && result.url) {
      if (last) discardLessonPicture(last.path);
      setPreview({ path: result.path, url: result.url });
    } else setError(result.error ?? "The request failed.");
  };
  const approve = async () => {
    if (!preview) return;
    setBusy(true);
    const result = await applyLessonPicture(lessonId, preview.path).catch(() => ({ error: "The request failed." }));
    setBusy(false);
    if (result.error) return setError(result.error);
    setPreview(null);
    setNote("");
    router.refresh();
  };
  const cancel = () => {
    if (preview) discardLessonPicture(preview.path);
    setPreview(null);
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
              if (!busy) make();
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
          onClick={make}
          disabled={busy}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
        >
          {busy && !preview ? "Creating… (up to two minutes)" : hasPicture ? "🔄 Regenerate picture" : "✨ Create AI picture"}
        </button>
        {error && !preview && <span className="text-sm text-red-700">{error}</span>}
      </span>

      {preview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Preview the new picture"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div className="max-h-full w-full max-w-4xl overflow-auto rounded-lg bg-white p-4 shadow-xl">
            <p className="mb-3 font-medium">Preview the new picture</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.url} alt="" className="mb-4 h-auto w-full rounded border border-slate-200 object-contain" />
            {hasPicture && (
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={300}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (!busy) make();
                  }
                }}
                placeholder="Optional: what should be different next time?"
                className="mb-3 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
            )}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={approve}
                disabled={busy}
                className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-onaccent hover:brightness-90 disabled:opacity-50"
              >
                Use this picture
              </button>
              <button
                type="button"
                onClick={make}
                disabled={busy}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
              >
                {busy ? "Working… (up to two minutes)" : "🔄 Try again"}
              </button>
              <button
                type="button"
                onClick={cancel}
                disabled={busy}
                className="rounded-md px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              {error && <span className="text-sm text-red-700">{error}</span>}
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
