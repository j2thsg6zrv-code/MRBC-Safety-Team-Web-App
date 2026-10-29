import Link from "next/link";
import { redirect } from "next/navigation";
import { Status } from "@/components/Status";
import { Button, Card, Field, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { finish, text, type SearchParams } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { formatWhen, type TrainingClass } from "@/lib/training";

async function createClass(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  const { count } = await supabase.from("training_classes").select("id", { count: "exact", head: true });
  const { data, error } = await supabase
    .from("training_classes")
    .insert({ title: text(formData, "title") ?? "New class", sort_order: (count ?? 0) + 1 })
    .select("id")
    .single();
  if (error || !data) finish("/training/manage", error);
  redirect(`/training/manage/${data.id}?saved=Class+created+as+a+draft.`);
}

export default async function ManageTrainingPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const supabase = await createClient();
  const [{ data: classes }, { data: passes }] = await Promise.all([
    supabase.from("training_classes").select("*, qualifications(name)").order("sort_order").order("title"),
    supabase
      .from("training_attempts")
      .select("id, created_at, correct, total, profile_id, profiles(full_name, email), training_classes(title)")
      .eq("passed", true)
      .order("created_at", { ascending: false })
      .limit(25),
  ]);
  const list = (classes ?? []) as (TrainingClass & { qualifications: { name: string } | null })[];
  const recent = (passes ?? []) as unknown as {
    id: string;
    created_at: string;
    correct: number;
    total: number;
    profile_id: string;
    profiles: { full_name: string; email: string } | null;
    training_classes: { title: string } | null;
  }[];

  return (
    <>
      <Link href="/training" className="mb-2 inline-block text-sm text-blue-700 underline">← Training</Link>
      <PageHeader title="Manage Classes" />
      <Status searchParams={searchParams} />
      <p className="mb-4 text-slate-700">
        New classes start as drafts that only admins can see. Open a class to review it, then approve it so the team can
        take it. When someone passes, the class&apos;s qualification is added to their profile and admins get an email.
      </p>

      <Card className="mb-4">
        <ul className="divide-y divide-slate-100">
          {list.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <div>
                <Link href={`/training/${c.id}`} className="font-medium text-blue-700 underline">
                  {c.title}
                </Link>
                <p className="text-xs text-slate-500">
                  {c.minutes ? `${c.minutes} min · ` : ""}
                  {c.qualifications ? `Earns ${c.qualifications.name}` : "No certification set"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {c.status === "draft" ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Draft</span>
                ) : (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Approved</span>
                )}
                <Link href={`/training/manage/${c.id}`} className="text-sm text-blue-700 underline">
                  Edit
                </Link>
              </div>
            </li>
          ))}
          {list.length === 0 && <li className="py-2 text-sm text-slate-500">No classes yet.</li>}
        </ul>
      </Card>

      <Card className="mb-8">
        <h2 className="mb-3 font-semibold">Add a class</h2>
        <form action={createClass} className="flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1">
            <Field label="Title" name="title" required />
          </div>
          <Button type="submit">Create draft</Button>
        </form>
      </Card>

      <h2 className="mb-2 font-semibold">Recent completions</h2>
      <Card>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-500">Nobody has passed a class yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span>
                  <Link href={`/members/${r.profile_id}`} className="font-medium text-blue-700 underline">
                    {r.profiles?.full_name || r.profiles?.email}
                  </Link>{" "}
                  passed {r.training_classes?.title} ({r.correct} of {r.total})
                </span>
                <span className="text-xs text-slate-500">{formatWhen(r.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
