import Link from "next/link";
import { Status } from "@/components/Status";
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
      .select("*, qualifications(name)")
      .order("sort_order")
      .order("title"),
    supabase
      .from("training_attempts")
      .select("class_id, correct, total, passed, created_at")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const list = (classes ?? []) as (TrainingClass & { qualifications: { name: string } | null })[];
  const mine = attemptsByClass((attempts ?? []) as TrainingAttempt[]);
  const titles = new Map(list.map((c) => [c.id, c.title]));
  const visible = list.filter((c) => c.status === "approved");
  const drafts = list.filter((c) => c.status === "draft");

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
        Read each lesson, then take the short quiz. When you pass, the class&apos;s certification is added to your
        qualifications on My Profile.
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
                  {c.minutes && c.qualifications ? " · " : null}
                  {c.qualifications ? `Earns ${c.qualifications.name}` : null}
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
