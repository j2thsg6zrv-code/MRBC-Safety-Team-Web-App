import Link from "next/link";
import { Status } from "@/components/Status";
import { TeamTrainingProgress, type AttemptRow, type ProgressRow } from "@/components/TeamTrainingProgress";
import { Card, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import type { SearchParams } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { attemptsByClass, formatWhen, type TrainingAttempt, type TrainingClass } from "@/lib/training";

export default async function TrainingPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const [{ data: classes }, { data: attempts }] = await Promise.all([
    // Members only get approved classes back; admins get drafts too.
    supabase
      .from("training_classes")
      .select("*, certifications(name)")
      .order("sort_order")
      .order("title"),
    supabase
      .from("training_attempts")
      .select("class_id, correct, total, passed, created_at")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const list = (classes ?? []) as (TrainingClass & { certifications: { name: string } | null })[];
  const mine = attemptsByClass((attempts ?? []) as TrainingAttempt[]);
  const titles = new Map(list.map((c) => [c.id, c.title]));
  const visible = list.filter((c) => c.status === "approved");
  const drafts = list.filter((c) => c.status === "draft");

  // Everyone's progress, for admins only. The database also only returns other
  // members' progress and quiz tries to admins. Loaded one after another, not
  // all at once, to keep the page simple to stream.
  let team: Parameters<typeof TeamTrainingProgress>[0] | null = null;
  if (user.isAdmin && visible.length > 0) {
    const { data: members } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("active", true)
      .order("full_name");
    const { data: progress } = await supabase
      .from("training_progress")
      .select("profile_id, class_id, done_through, current_slide, quiz_answers, started_at, completed_at, updated_at");
    const { data: allAttempts } = await supabase.from("training_attempts").select("profile_id, class_id, passed, created_at");
    const { data: lessons } = await supabase.from("training_lessons").select("class_id");
    const { data: questions } = await supabase.from("training_questions").select("class_id");
    const count = (rows: { class_id: string }[] | null, id: string) => (rows ?? []).filter((r) => r.class_id === id).length;
    team = {
      classes: visible.map((c) => ({ id: c.id, title: c.title, lessons: count(lessons, c.id), questions: count(questions, c.id) })),
      members: members ?? [],
      progress: (progress ?? []) as ProgressRow[],
      attempts: (allAttempts ?? []) as AttemptRow[],
    };
  }

  return (
    <>
      <PageHeader title="Training">
        {user.isAdmin && (
          <Link href="/training/manage" className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-onaccent hover:brightness-90">
            Manage classes
          </Link>
        )}
      </PageHeader>
      <Status searchParams={searchParams} />
      <p className="mb-4 text-slate-700">
        Read each lesson, then take the short quiz. When you pass, the class&apos;s certification is added to My
        Certifications.
      </p>

      {visible.length === 0 && (
        <Card>
          <p className="text-sm text-slate-500">No classes are available yet. Check back soon.</p>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {visible.map((c) => {
          const attempt = mine.get(c.id);
          const locked = c.prerequisite_id && !mine.get(c.prerequisite_id)?.passed;
          return (
            <Link key={c.id} href={`/training/${c.id}`} className="block">
              <Card className="h-full hover:border-blue-400">
                <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-semibold">{c.title}</h2>
                  {attempt?.passed ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      Passed {formatWhen(attempt.created_at)}
                    </span>
                  ) : attempt ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Try again</span>
                  ) : null}
                </div>
                {c.summary && <p className="mb-2 text-sm text-slate-600">{c.summary}</p>}
                <p className="text-xs text-slate-500">
                  {c.minutes ? `About ${c.minutes} minutes` : null}
                  {c.minutes && c.certifications ? " · " : null}
                  {c.certifications ? `Earns ${c.certifications.name}` : null}
                </p>
                {locked && (
                  <p className="mt-1 text-xs text-slate-500">
                    Pass {titles.get(c.prerequisite_id!) ?? "the earlier class"} first.
                  </p>
                )}
              </Card>
            </Link>
          );
        })}
      </div>

      {team && <TeamTrainingProgress {...team} />}

      {user.isAdmin && drafts.length > 0 && (
        <>
          <h2 className="mb-2 mt-8 font-semibold">Waiting for approval ({drafts.length})</h2>
          <p className="mb-3 text-sm text-slate-600">Only admins can see these. Open one to review it and approve it for the team.</p>
          <Card>
            <ul className="divide-y divide-slate-100">
              {drafts.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <Link href={`/training/${c.id}`} className="font-medium text-blue-700 underline">
                    {c.title}
                  </Link>
                  <Link href={`/training/manage/${c.id}`} className="text-sm text-blue-700 underline">
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </>
  );
}
