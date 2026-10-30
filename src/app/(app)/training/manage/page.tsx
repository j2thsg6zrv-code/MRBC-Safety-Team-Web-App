import Link from "next/link";
import { redirect } from "next/navigation";
import { Status } from "@/components/Status";
import { Button, Card, Field, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { finish, text, type SearchParams } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { DeleteClassButton } from "@/components/DeleteClassButton";
import { PowerPointImport } from "@/components/PowerPointImport";
import type { DeckToSave } from "@/lib/pptx";
import { formatWhen, PICTURE_BUCKET, PICTURE_PATH, type TrainingClass } from "@/lib/training";

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

async function importPowerPoint(formData: FormData) {
  "use server";
  await requireAdmin();
  // The browser reads the .pptx (see PowerPointImport) and sends just the text.
  let deck: DeckToSave;
  try {
    deck = JSON.parse(String(formData.get("deck") ?? ""));
  } catch {
    finish("/training/manage", { message: "That file couldn't be read as a PowerPoint." });
  }
  if (!deck?.title || !Array.isArray(deck.slides) || deck.slides.length === 0) {
    finish("/training/manage", { message: "No text was found on the slides in that file." });
  }
  const supabase = await createClient();
  const { count } = await supabase.from("training_classes").select("id", { count: "exact", head: true });
  const { data, error } = await supabase
    .from("training_classes")
    .insert({ title: String(deck.title), summary: deck.summary ? String(deck.summary) : null, sort_order: (count ?? 0) + 1 })
    .select("id")
    .single();
  if (error || !data) finish("/training/manage", error);
  const { error: lessonError } = await supabase
    .from("training_lessons")
    .insert(
      deck.slides.map((slide, i) => ({
        class_id: data.id,
        position: i + 1,
        title: String(slide.title),
        body: String(slide.body ?? ""),
        // Pictures the browser uploaded from the slides.
        image_path: slide.image_path && PICTURE_PATH.test(slide.image_path) ? slide.image_path : null,
      })),
    );
  if (lessonError) finish(`/training/manage/${data.id}`, lessonError);
  const saved = `Imported ${deck.slides.length} slides as a draft. Review the text, add quiz questions, then approve it.`;
  redirect(`/training/manage/${data.id}?${new URLSearchParams({ saved })}`);
}

async function deleteClass(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  // The database only lets people on class_deleters delete; see migration 0033.
  const { data: pictures, error } = await supabase.rpc("delete_training_class", {
    p_class: String(formData.get("id") ?? ""),
  });
  // A "not allowed" note is our own message, not a bug for the Bug console.
  if (error) finish("/training/manage", error.code === "P0001" ? { message: error.message } : error);
  const paths = ((pictures ?? []) as string[]).filter((path) => PICTURE_PATH.test(path));
  if (paths.length > 0) await supabase.storage.from(PICTURE_BUCKET).remove(paths);
  finish("/training/manage", null, "Class deleted.");
}

export default async function ManageTrainingPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireAdmin();
  const supabase = await createClient();
  const [{ data: classes }, { data: passes }, { data: deleter }] = await Promise.all([
    supabase.from("training_classes").select("*, certifications(name)").order("sort_order").order("title"),
    supabase
      .from("training_attempts")
      .select("id, created_at, correct, total, profile_id, profiles(full_name, email), training_classes(title)")
      .eq("passed", true)
      .order("created_at", { ascending: false })
      .limit(25),
    supabase.from("class_deleters").select("profile_id").eq("profile_id", user.id).maybeSingle(),
  ]);
  const canDelete = !!deleter;
  const list = (classes ?? []) as (TrainingClass & { certifications: { name: string } | null })[];
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
        take it. When someone passes, the class&apos;s certification is added to their My Certifications and admins get an email.
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
                  {c.certifications ? `Earns ${c.certifications.name}` : "No certification set"}
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
                {canDelete && <DeleteClassButton classId={c.id} title={c.title} action={deleteClass} />}
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

      <Card className="mb-8">
        <h2 className="mb-1 font-semibold">Import a PowerPoint</h2>
        <p className="mb-3 text-sm text-slate-600">
          Each slide becomes a lesson slide: its title, its text as bullet points, its speaker notes, and its biggest
          picture as the slide&apos;s picture. The class is saved as a draft so you can review it, add a quiz, and approve
          it when it&apos;s ready. Charts and drawn shapes aren&apos;t carried over, so describe them in the text if they
          matter.
        </p>
        <PowerPointImport action={importPowerPoint} />
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
