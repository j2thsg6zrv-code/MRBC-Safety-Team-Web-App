import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { LessonBody } from "@/components/LessonBody";
import { LessonSlides } from "@/components/LessonSlides";
import { QuizAutosave } from "@/components/QuizAutosave";
import { Status } from "@/components/Status";
import { Button, Card, PageHeader } from "@/components/ui";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { finish, type SearchParams } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import type { SavedProgress } from "../actions";
import {
  attemptsByClass,
  formatWhen,
  pictureUrls,
  type TrainingAttempt,
  type TrainingClass,
  type TrainingLesson,
  type TrainingQuestion,
} from "@/lib/training";

async function submitQuiz(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const count = Number(formData.get("question_count"));
  const answers = Array.from({ length: count }, (_, i) => {
    const value = formData.get(`q${i}`);
    return value === null ? -1 : Number(value);
  });
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_training_quiz", { p_class: id, p_answers: answers });
  if (error || !data) finish(`/training/${id}`, error);
  const attempt = data as TrainingAttempt;
  // Start the quiz fresh next time.
  await supabase.from("training_progress").update({ quiz_answers: {} }).eq("class_id", id).eq("profile_id", (await getCurrentUser()).id);
  revalidatePath("/training");
  revalidatePath("/profile");
  const params = new URLSearchParams(
    attempt.passed
      ? { saved: `You passed with ${attempt.correct} of ${attempt.total} correct. Your certification has been added to My Profile.` }
      : { error: `You got ${attempt.correct} of ${attempt.total} correct, which isn't enough to pass yet. Review the lessons and try again.` },
  );
  redirect(`/training/${id}?${params}`);
}

async function setStatus(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const supabase = await createClient();
  if (status === "approved") {
    const { count } = await supabase.from("training_questions").select("id", { count: "exact", head: true }).eq("class_id", id);
    if (!count) finish(`/training/${id}`, { message: "Add at least one quiz question before approving this class." });
  }
  const { error } = await supabase.from("training_classes").update({ status }).eq("id", id);
  revalidatePath("/training");
  finish(`/training/${id}`, error, status === "approved" ? "Approved. The team can now take this class." : "Moved back to draft. The team can no longer see it.");
}

export default async function ClassPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const supabase = await createClient();

  const [{ data: cls }, { data: lessons }, { data: questions }, { data: attempts }, { data: progress }] = await Promise.all([
    supabase.from("training_classes").select("*, qualifications(name)").eq("id", id).maybeSingle(),
    supabase.from("training_lessons").select("*").eq("class_id", id).order("position").order("created_at"),
    supabase.from("training_questions").select("id, position, prompt, choices").eq("class_id", id).order("position").order("created_at"),
    supabase
      .from("training_attempts")
      .select("class_id, correct, total, passed, created_at")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("training_progress")
      .select("done_through, current_slide, quiz_answers")
      .eq("class_id", id)
      .eq("profile_id", user.id)
      .maybeSingle(),
  ]);
  if (!cls) notFound();
  const saved = progress as SavedProgress | null;

  const c = cls as TrainingClass & { qualifications: { name: string } | null };
  const mine = attemptsByClass((attempts ?? []) as TrainingAttempt[]);
  const attempt = mine.get(c.id);
  let prerequisite: { id: string; title: string } | null = null;
  if (c.prerequisite_id && !mine.get(c.prerequisite_id)?.passed) {
    const { data } = await supabase.from("training_classes").select("id, title").eq("id", c.prerequisite_id).maybeSingle();
    prerequisite = data ?? { id: c.prerequisite_id, title: "the earlier class" };
  }
  const quiz = (questions ?? []) as TrainingQuestion[];
  const lessonList = (lessons ?? []) as TrainingLesson[];
  const pictures = await pictureUrls(supabase, lessonList.map((l) => l.image_path));
  const isDraft = c.status === "draft";

  return (
    <>
      <Link href="/training" className="mb-2 inline-block text-sm text-blue-700 underline">← Training</Link>
      <PageHeader title={c.title}>
        {user.isAdmin && (
          <Link href={`/training/manage/${c.id}`} className="text-sm text-blue-700 underline">
            Edit class
          </Link>
        )}
      </PageHeader>
      <Status searchParams={searchParams} />

      {user.isAdmin && (
        <Card className={`mb-4 ${isDraft ? "border-amber-700" : ""}`}>
          <form action={setStatus} className="flex flex-wrap items-center justify-between gap-3">
            <input type="hidden" name="id" value={c.id} />
            {isDraft ? (
              <>
                <p className="text-sm">
                  <span className="font-semibold">Draft.</span> Only admins can see this class. Review the lessons and quiz
                  below, then approve it for the team.
                </p>
                <Button type="submit" name="status" value="approved">Approve for use</Button>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600">
                  Approved{c.approved_at ? ` on ${formatWhen(c.approved_at)}` : ""}. The team can take this class.
                </p>
                <Button type="submit" variant="secondary" name="status" value="draft">Move back to draft</Button>
              </>
            )}
          </form>
        </Card>
      )}

      <Card className="mb-4">
        {c.summary && <p className="mb-2 text-slate-700">{c.summary}</p>}
        <p className="text-sm text-slate-500">
          {c.minutes ? `About ${c.minutes} minutes · ` : ""}
          {lessonList.length} lessons · {quiz.length}-question quiz · pass with {c.pass_percent}%
          {c.qualifications ? ` · earns ${c.qualifications.name}` : ""}
        </p>
        {attempt?.passed && (
          <p className="mt-2 text-sm font-medium text-green-700">
            You passed on {formatWhen(attempt.created_at)} ({attempt.correct} of {attempt.total}). You can
            take it again any time to renew your certification.
          </p>
        )}
      </Card>

      <LessonSlides
        lessons={lessonList}
        canSkip={user.isAdmin}
        classId={c.id}
        saved={saved}
        slide={Object.fromEntries(
          lessonList.map((l) => [
            l.id,
            <div key={l.id}>
              {l.image_path && pictures[l.image_path] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pictures[l.image_path]}
                  alt=""
                  className="mb-4 aspect-[3/2] w-full rounded-lg border border-slate-200 object-cover"
                />
              )}
              <LessonBody body={l.body} />
            </div>,
          ]),
        )}
        quiz={
        <Card>
          <h2 className="mb-3 font-semibold">Quiz</h2>
          {quiz.length === 0 ? (
            <p className="text-sm text-slate-500">This class has no quiz questions yet.</p>
          ) : prerequisite && !isDraft ? (
            <p className="text-sm text-slate-700">
              Pass{" "}
              <Link href={`/training/${prerequisite.id}`} className="text-blue-700 underline">
                {prerequisite.title}
              </Link>{" "}
              before taking this quiz.
            </p>
          ) : (
            <form action={submitQuiz} className="space-y-5">
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="question_count" value={quiz.length} />
              <QuizAutosave classId={c.id} saved={saved?.quiz_answers ?? {}} />
              {quiz.map((q, i) => (
                <fieldset key={q.id}>
                  <legend className="mb-2 font-medium">
                    {i + 1}. {q.prompt}
                  </legend>
                  <div className="space-y-1">
                    {q.choices.map((choice, j) => (
                      <label key={j} className="flex items-start gap-2 rounded-md px-2 py-1 hover:bg-slate-50">
                        <input type="radio" name={`q${i}`} value={j} required className="mt-1" />
                        <span>{choice}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
              {isDraft ? (
                <p className="text-sm text-slate-500">This is a preview. The quiz can be taken once the class is approved.</p>
              ) : (
                <Button type="submit" pendingLabel="Grading…">Submit answers</Button>
              )}
            </form>
          )}
        </Card>
        }
      />
    </>
  );
}
