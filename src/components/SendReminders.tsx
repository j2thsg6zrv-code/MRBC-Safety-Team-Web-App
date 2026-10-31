"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/Button";
import { formatDate, formatTime } from "@/lib/dates";

export type UpcomingEvent = {
  date: string;
  time: string;
  title: string;
  /** Days from today (0 = today), used to filter by the chosen window. */
  daysAway: number;
  positions: { name: string; slots: number; profileIds: string[] }[];
};

const WINDOWS = [
  { days: 2, label: "Today and tomorrow" },
  { days: 3, label: "Next 3 days" },
  { days: 7, label: "Next 7 days" },
  { days: 14, label: "Next 2 weeks" },
  { days: 30, label: "Next 30 days" },
];

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * One admin button that emails a group right now. It shows who would get the
 * email for the chosen window, then asks "are you sure?" before sending.
 */
function SendButton({
  title,
  help,
  buttonLabel,
  action,
  events,
  describe,
  defaultDays = 7,
}: {
  title: string;
  help: string;
  buttonLabel: string;
  action: (formData: FormData) => Promise<void>;
  events: UpcomingEvent[];
  describe: (inWindow: UpcomingEvent[]) => { recipients: number; lines: string[]; empty: string; confirm: string };
  defaultDays?: number;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [days, setDays] = useState(defaultDays);
  const { recipients, lines, empty, confirm } = describe(events.filter((e) => e.daysAway < days));

  return (
    <div className="rounded-md border border-slate-200 p-3">
      <h3 className="font-medium">{title}</h3>
      <p className="mb-2 text-sm text-slate-600">{help}</p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          aria-label="How far ahead"
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
        >
          {WINDOWS.map((w) => (
            <option key={w.days} value={w.days}>
              {w.label}
            </option>
          ))}
        </select>
        <Button type="button" variant="secondary" disabled={recipients === 0} onClick={() => dialog.current?.showModal()}>
          {buttonLabel}
        </Button>
      </div>
      <p className="mt-2 text-sm text-slate-600">{recipients === 0 ? empty : confirm}</p>
      <dialog
        ref={dialog}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-slate-200 bg-white p-0 text-slate-900 shadow-lg backdrop:bg-black/40"
      >
        <form action={action} onSubmit={() => dialog.current?.close()} className="space-y-3 p-4">
          <input type="hidden" name="days" value={days} />
          <h2 className="font-semibold">{title}?</h2>
          <p className="text-sm text-slate-700">{confirm}</p>
          {lines.length > 0 && (
            <ul className="max-h-60 list-disc space-y-1 overflow-y-auto pl-5 text-sm text-slate-700">
              {lines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => dialog.current?.close()}>
              Cancel
            </Button>
            <Button type="submit" pendingLabel="Sending…">
              Send {plural(recipients, "email")}
            </Button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

const when = (e: UpcomingEvent) => `${formatDate(e.date, "short")} ${formatTime(e.time)}`;

/** Admin buttons to remind people who are serving, and to ask the team to fill open spots. */
export function SendReminders({
  events,
  emailable,
  teamSize,
  remindAction,
  openSpotsAction,
}: {
  events: UpcomingEvent[];
  /** Active members who get email. */
  emailable: string[];
  teamSize: number;
  remindAction: (formData: FormData) => Promise<void>;
  openSpotsAction: (formData: FormData) => Promise<void>;
}) {
  const canEmail = new Set(emailable);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SendButton
        title="Remind everyone signed up"
        help="Emails each person their shifts in the time you pick, and asks them to take their name off if they can't make it."
        buttonLabel="Send reminders…"
        action={remindAction}
        events={events}
        describe={(inWindow) => {
          const people = new Set(
            inWindow.flatMap((e) => e.positions.flatMap((p) => p.profileIds)).filter((id) => canEmail.has(id)),
          );
          const shifts = inWindow.flatMap((e) =>
            e.positions.filter((p) => p.profileIds.length > 0).map((p) => `${when(e)}: ${e.title}, ${p.name} (${p.profileIds.length})`),
          );
          return {
            recipients: people.size,
            lines: shifts,
            empty: "Nobody is signed up for a shift in this time.",
            confirm: `This emails ${plural(people.size, "person")} signed up for ${plural(shifts.length, "spot")}.`,
          };
        }}
      />
      <SendButton
        title="Ask the team to fill open spots"
        help="Emails every active member a list of the positions that still need people, with a link to sign up."
        buttonLabel="Send open spots…"
        action={openSpotsAction}
        defaultDays={2}
        events={events}
        describe={(inWindow) => {
          const open = inWindow.flatMap((e) =>
            e.positions
              .filter((p) => p.profileIds.length < p.slots)
              .map((p) => `${when(e)}: ${e.title}, ${p.name} (${p.slots - p.profileIds.length} open)`),
          );
          const recipients = open.length > 0 ? canEmail.size : 0;
          return {
            recipients,
            lines: open,
            empty: "Every spot in this time is filled.",
            confirm: `This emails all ${plural(recipients, "member")} about ${plural(open.length, "open position")}${
              teamSize > recipients ? ` (${teamSize - recipients} turned email off)` : ""
            }.`,
          };
        }}
      />
    </div>
  );
}
