"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { writeClassTest, writeLessonScript } from "@/app/(app)/training/actions";

// Slides written at the same time. More finishes sooner but risks the API's rate limits.
const AT_ONCE = 3;

/**
 * Has Claude write the whole class: each slide's title, reader script, and
 * check question, sized to the class length, then the 10-question final test.
 * Starts on its own when the import sends the admin here with `autoStart`.
 */
export function WriteClass({
  classId,
  lessonIds,
  defaultMinutes,
  autoStart,
}: {
  classId: string;
  lessonIds: string[];
  defaultMinutes: number;
  autoStart: boolean;
}) {
  const router = useRouter();
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [status, setStatus] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const started = useRef(false);

  const run = async (length: number) => {
    if (started.current) return;
    started.current = true;
    setRunning(true);
    setErrors([]);
    let done = 0;
    let next = 0;
    setStatus(`Writing slides: 0 of ${lessonIds.length} done…`);
    const worker = async () => {
      while (next < lessonIds.length) {
        const i = next++;
        const result = await writeLessonScript(lessonIds[i], length).catch(() => ({ error: "The request failed." }));
        if (result.error) setErrors((e) => [...e, `Slide ${i + 1}: ${result.error}`]);
        setStatus(`Writing slides: ${++done} of ${lessonIds.length} done…`);
      }
    };
    await Promise.all(Array.from({ length: Math.min(AT_ONCE, lessonIds.length) }, worker));
    setStatus("Writing the 10-question final test…");
    const test = await writeClassTest(classId, length).catch(() => ({ error: "The request failed." }));
    if (test.error) setErrors((e) => [...e, `Final test: ${test.error}`]);
    setStatus("Done. Read through the slides below before you approve the class.");
    setRunning(false);
    started.current = false;
    // Drop ?write=1 so a reload doesn't start over.
    router.replace(`/training/manage/${classId}`);
    router.refresh();
  };

  useEffect(() => {
    if (autoStart && lessonIds.length) run(defaultMinutes);
    // Runs once, when the page opens from an import.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (lessonIds.length === 0) return <p className="text-sm text-slate-600">Add slides first.</p>;

  const start = () => {
    if (!confirm("This replaces every slide's title, script, and check question, and the final test. Continue?")) return;
    run(minutes);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Class length (minutes)</span>
          <input
            type="number"
            min={5}
            max={240}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            disabled={running}
            className="w-28 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={start}
          disabled={running || !(minutes >= 5)}
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-onaccent hover:brightness-90 disabled:opacity-50"
        >
          {running ? "Writing…" : "✨ Write the class"}
        </button>
      </div>
      {status && <p className="text-sm text-slate-600">{status}</p>}
      {running && (
        <p className="text-sm text-slate-600">
          Keep this page open. Each slide takes a minute or two while Claude checks facts online.
        </p>
      )}
      {errors.length > 0 && (
        <>
          <ul className="list-disc pl-5 text-sm text-red-700">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          {!running && <p className="text-sm text-slate-600">You can run it again, or fix those slides by hand below.</p>}
        </>
      )}
    </div>
  );
}
