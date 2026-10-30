import Link from "next/link";
import { Card } from "@/components/ui";
import { formatDuration, formatWhen } from "@/lib/training";

export type ProgressRow = {
  profile_id: string;
  class_id: string;
  done_through: number;
  current_slide: number;
  quiz_answers: Record<string, number>;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
};

export type AttemptRow = { profile_id: string; class_id: string; passed: boolean; created_at: string };

type Member = { id: string; full_name: string; email: string };
type ClassInfo = { id: string; title: string; lessons: number; questions: number };

type Entry = { member: Member; progress: ProgressRow | null; tries: string[]; firstPass: string | null };

/**
 * Admins only: for each class, who has started it, where they are in it, and
 * for those who passed, how long it took from starting to passing.
 */
export function TeamTrainingProgress({
  classes,
  members,
  progress,
  attempts,
}: {
  classes: ClassInfo[];
  members: Member[];
  progress: ProgressRow[];
  attempts: AttemptRow[];
}) {
  const byMember = new Map(members.map((m) => [m.id, m]));
  return (
    <>
      <h2 className="mb-1 mt-8 font-semibold">Team progress</h2>
      <p className="mb-3 text-sm text-slate-600">
        Only admins can see this. Time to complete runs from when someone first opened the class to when they first
        passed the quiz, including any breaks.
      </p>
      <div className="space-y-3">
        {classes.map((c) => {
          const entries = new Map<string, Entry>();
          const entry = (profileId: string) => {
            const member = byMember.get(profileId);
            if (!member) return null;
            let e = entries.get(profileId);
            if (!e) entries.set(profileId, (e = { member, progress: null, tries: [], firstPass: null }));
            return e;
          };
          for (const p of progress) if (p.class_id === c.id) { const e = entry(p.profile_id); if (e) e.progress = p; }
          for (const a of attempts) {
            if (a.class_id !== c.id) continue;
            const e = entry(a.profile_id);
            if (!e) continue;
            e.tries.push(a.created_at);
            if (a.passed && (!e.firstPass || a.created_at < e.firstPass)) e.firstPass = a.created_at;
          }
          const list = [...entries.values()];
          const done = list.filter((e) => e.progress?.completed_at || e.firstPass);
          const going = list
            .filter((e) => !(e.progress?.completed_at || e.firstPass))
            .sort((a, b) => (b.progress?.updated_at ?? "").localeCompare(a.progress?.updated_at ?? ""));
          const notStarted = members.filter((m) => !entries.has(m.id));
          return (
            <Card key={c.id} className="!p-0">
              <details className="group">
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-4 py-3 [&::-webkit-details-marker]:hidden">
                  <span className="font-medium">
                    <span className="mr-1 inline-block text-slate-400 group-open:rotate-90">▸</span>
                    {c.title}
                  </span>
                  <span className="text-xs text-slate-500">
                    {done.length} completed · {going.length} in progress · {notStarted.length} not started
                  </span>
                </summary>
                <div className="border-t border-slate-100 px-4 py-3">
                  {list.length === 0 && <p className="text-sm text-slate-500">Nobody has started this class yet.</p>}
                  <ul className="divide-y divide-slate-100">
                    {[...going, ...done].map((e) => (
                      <li key={e.member.id} className="flex flex-wrap items-start justify-between gap-2 py-2 text-sm">
                        <Link href={`/members/${e.member.id}`} className="font-medium text-blue-700 underline">
                          {e.member.full_name || e.member.email}
                        </Link>
                        <Where entry={e} lessons={c.lessons} questions={c.questions} />
                      </li>
                    ))}
                  </ul>
                  {notStarted.length > 0 && list.length > 0 && (
                    <p className="mt-2 text-xs text-slate-500">
                      Not started: {notStarted.map((m) => m.full_name || m.email).join(", ")}
                    </p>
                  )}
                </div>
              </details>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function Where({ entry, lessons, questions }: { entry: Entry; lessons: number; questions: number }) {
  const p = entry.progress;
  const started = p?.started_at ?? null;
  const completed = p?.completed_at ?? entry.firstPass;
  const failed = entry.firstPass ? entry.tries.filter((t) => t < entry.firstPass!).length : 0;
  const triesNote = failed > 0 ? ` · passed on try ${failed + 1}` : "";

  if (completed) {
    return (
      <span className="text-right">
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
          Completed {formatWhen(completed)}
        </span>
        <span className="mt-1 block text-xs text-slate-500">
          {started ? `Took ${formatDuration(started, completed)}` : "Start time not recorded"}
          {triesNote}
        </span>
      </span>
    );
  }

  const slidesDone = Math.min(Math.max((p?.done_through ?? -1) + 1, 0), lessons);
  const onQuiz = p && lessons > 0 && p.current_slide >= lessons;
  const answered = p ? Object.keys(p.quiz_answers ?? {}).length : 0;
  const percent = lessons > 0 ? Math.round((slidesDone / lessons) * 100) : 0;
  return (
    <span className="min-w-48 text-right">
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
        {onQuiz
          ? `On the quiz${questions ? ` · ${answered} of ${questions} answered` : ""}`
          : `Slide ${Math.min(slidesDone + 1, Math.max(lessons, 1))} of ${lessons}`}
      </span>
      <span className="ml-auto mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <span className="block h-full rounded-full bg-blue-600" style={{ width: `${onQuiz ? 100 : percent}%` }} />
      </span>
      <span className="mt-1 block text-xs text-slate-500">
        {started ? `Started ${formatWhen(started)}` : "Start date not recorded"}
        {p ? ` · last active ${formatWhen(p.updated_at)}` : ""}
        {entry.tries.length > 0
          ? ` · ${entry.tries.length} quiz ${entry.tries.length === 1 ? "try" : "tries"}, not passed yet`
          : ""}
      </span>
    </span>
  );
}
