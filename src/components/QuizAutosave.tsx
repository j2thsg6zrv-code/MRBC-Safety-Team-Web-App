"use client";

import { useEffect, useRef } from "react";
import { saveProgress } from "@/app/(app)/training/actions";

// Latest answers per class on this page, so going back to the slides and
// returning to the quiz keeps choices made since the page loaded.
const latest = new Map<string, Record<string, number>>();

/**
 * Put inside the quiz form: ticks the answers saved last time and saves each
 * new choice, so a member who closes the app keeps their answers.
 */
export function QuizAutosave({ classId, saved }: { classId: string; saved: Record<string, number> }) {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const form = marker.current?.closest("form");
    if (!form) return;
    const answers: Record<string, number> = { ...(latest.get(classId) ?? saved) };
    latest.set(classId, answers);
    for (const [q, choice] of Object.entries(answers)) {
      const input = form.querySelector<HTMLInputElement>(`input[name="q${q}"][value="${choice}"]`);
      if (input) input.checked = true;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onChange = (e: Event) => {
      const input = e.target as HTMLInputElement;
      const match = input.name.match(/^q(\d+)$/);
      if (!match) return;
      answers[match[1]] = Number(input.value);
      clearTimeout(timer);
      timer = setTimeout(() => saveProgress(classId, { quiz_answers: answers }).catch(() => {}), 300);
    };
    form.addEventListener("change", onChange);
    return () => {
      form.removeEventListener("change", onChange);
      clearTimeout(timer);
    };
  }, [classId, saved]);

  return <span ref={marker} hidden />;
}
