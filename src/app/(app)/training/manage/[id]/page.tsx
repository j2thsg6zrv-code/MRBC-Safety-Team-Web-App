import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { CreateAllPictures, NewPictureButton } from "@/components/CreatePictures";
import { Status } from "@/components/Status";
import { Button, Card, Field, PageHeader, Select, TextArea } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { finish, text, type SearchParams } from "@/lib/forms";
import { canCreatePictures, savePicture } from "@/lib/slidePictures";
import { createClient } from "@/lib/supabase/server";
import {
  PICTURE_BUCKET,
  pictureUrls,
  readChoices,
  type TrainingClass,
  type TrainingLesson,
  type TrainingQuestion,
} from "@/lib/training";

// Creating an AI picture can take a minute or two.
export const maxDuration = 120;

const path = (id: string) => `/training/manage/${id}`;

async function updateClass(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id"));
  const minutes = text(formData, "minutes");
  const supabase = await createClient();
  const { error } = await supabase
    .from("training_classes")
    .update({
      title: text(formData, "title") ?? "Untitled class",
      summary: text(formData, "summary"),
      minutes: minutes ? Number(minutes) : null,
      certification_id: text(formData, "certification_id"),
      qualification_id: text(formData, "qualification_id"),
      prerequisite_id: text(formData, "prerequisite_id"),
      pass_percent: Number(text(formData, "pass_percent") ?? 80),
      sort_order: Number(text(formData, "sort_order") ?? 0),
    })
    .eq("id", id);
  revalidatePath("/training");
  finish(path(id), error);
}

async function deleteClass(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("training_classes").delete().eq("id", String(formData.get("id")));
  if (error) finish(path(String(formData.get("id"))), error);
  revalidatePath("/training");
  redirect("/training/manage?saved=Class+deleted.");
}

function lessonFields(formData: FormData) {
  const checkChoices = readChoices(String(formData.get("check_choices") ?? ""));
  const checkAnswer = Number(text(formData, "check_answer") ?? 1) - 1;
  const hasCheck = !!text(formData, "check_prompt") && checkChoices.length >= 2;
  return {
    title: text(formData, "title") ?? "Untitled lesson",
    body: String(formData.get("body") ?? "").trim(),
    video_url: text(formData, "video_url"),
    position: Number(text(formData, "position") ?? 0),
    check_prompt: hasCheck ? text(formData, "check_prompt") : null,
    check_choices: hasCheck ? checkChoices : null,
    check_answer: hasCheck ? Math.min(Math.max(checkAnswer, 0), checkChoices.length - 1) : null,
    check_explanation: hasCheck ? text(formData, "check_explanation") : null,
  };
}

async function saveLesson(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id"));
  const lessonId = text(formData, "lesson_id");
  const supabase = await createClient();
  // A new picture replaces the old one; "remove" clears it.
  const file = formData.get("picture");
  let picture: { image_path?: string | null } = {};
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) finish(path(id), { message: "The picture must be an image file." });
    const saved = await savePicture(supabase, file, file.type);
    if (saved.error) finish(path(id), saved.error);
    picture = { image_path: saved.path };
  } else if (formData.get("remove_picture")) {
    picture = { image_path: null };
  }
  const old = lessonId && "image_path" in picture
    ? (await supabase.from("training_lessons").select("image_path").eq("id", lessonId).single()).data?.image_path
    : null;
  const { error } = lessonId
    ? await supabase.from("training_lessons").update({ ...lessonFields(formData), ...picture }).eq("id", lessonId)
    : await supabase.from("training_lessons").insert({ ...lessonFields(formData), ...picture, class_id: id });
  if (!error && old) await supabase.storage.from(PICTURE_BUCKET).remove([old]);
  finish(path(id), error, lessonId ? "Lesson saved." : "Lesson added.");
}

async function deleteLesson(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const lessonId = String(formData.get("lesson_id"));
  const { data: old } = await supabase.from("training_lessons").select("image_path").eq("id", lessonId).single();
  const { error } = await supabase.from("training_lessons").delete().eq("id", lessonId);
  if (!error && old?.image_path) await supabase.storage.from(PICTURE_BUCKET).remove([old.image_path]);
  finish(path(id), error, "Lesson deleted.");
}

async function saveQuestion(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id"));
  const questionId = text(formData, "question_id");
  const choices = readChoices(String(formData.get("choices") ?? ""));
  const correct = Number(text(formData, "correct") ?? 0) - 1;
  if (choices.length < 2 || choices.length > 6) {
    finish(path(id), { message: "A question needs between 2 and 6 choices, one per line." });
  }
  if (!(correct >= 0 && correct < choices.length)) {
    finish(path(id), { message: `The correct answer has to be a number from 1 to ${choices.length}.` });
  }
  const fields = {
    prompt: text(formData, "prompt") ?? "",
    choices,
    position: Number(text(formData, "position") ?? 0),
  };
  const supabase = await createClient();
  let qid = questionId;
  if (qid) {
    const { error } = await supabase.from("training_questions").update(fields).eq("id", qid);
    if (error) finish(path(id), error);
  } else {
    const { data, error } = await supabase
      .from("training_questions")
      .insert({ ...fields, class_id: id })
      .select("id")
      .single();
    if (error || !data) finish(path(id), error);
    qid = data.id;
  }
  const { error } = await supabase
    .from("training_answers")
    .upsert({ question_id: qid, correct_index: correct }, { onConflict: "question_id" });
  finish(path(id), error, questionId ? "Question saved." : "Question added.");
}

async function deleteQuestion(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.from("training_questions").delete().eq("id", String(formData.get("question_id")));
  finish(path(id), error, "Question deleted.");
}

function LessonForm({
  classId,
  lesson,
  next,
  pictureUrl,
  canCreate,
}: {
  classId: string;
  lesson?: TrainingLesson;
  next: number;
  pictureUrl?: string;
  canCreate: boolean;
}) {
  return (
    <form action={saveLesson} className="grid gap-3">
      <input type="hidden" name="id" value={classId} />
      {lesson && <input type="hidden" name="lesson_id" value={lesson.id} />}
      <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
        <Field label="Lesson title" name="title" defaultValue={lesson?.title} required />
        <Field label="Order" name="position" type="number" defaultValue={lesson?.position ?? next} />
      </div>
      <TextArea
        label="Lesson text"
        name="body"
        rows={lesson ? 8 : 5}
        defaultValue={lesson?.body}
        placeholder={"- Start a line with a dash for a bullet point\n- Put **two stars** around words to make them bold"}
      />
      <Field
        label="Video link (optional)"
        name="video_url"
        type="url"
        defaultValue={lesson?.video_url ?? ""}
        hint="YouTube links play right on the slide. Other links open in a new tab."
      />
      <div className="rounded-md border border-slate-200 p-3">
        <p className="mb-2 text-sm font-medium">Picture</p>
        <div className="flex flex-wrap items-start gap-3">
          {pictureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pictureUrl} alt="" className="w-48 rounded border border-slate-200" />
          ) : (
            <div className="flex h-32 w-48 items-center justify-center rounded bg-slate-100 text-sm text-slate-400">No picture</div>
          )}
          <div className="grid gap-2 text-sm">
            <label className="grid gap-1">
              {pictureUrl ? "Replace with your own picture" : "Upload a picture"}
              <input type="file" name="picture" accept="image/*" className="text-sm" />
            </label>
            {pictureUrl && (
              <label className="flex items-center gap-2">
                <input type="checkbox" name="remove_picture" /> Remove the picture
              </label>
            )}
            {lesson && canCreate && <NewPictureButton lessonId={lesson.id} hasPicture={!!pictureUrl} />}
          </div>
        </div>
      </div>
      <details className="rounded-md border border-slate-200 p-3" open={!!lesson?.check_prompt}>
        <summary className="cursor-pointer text-sm font-medium">Check your understanding (optional practice question)</summary>
        <div className="mt-3 grid gap-3">
          <Field label="Question or scenario" name="check_prompt" defaultValue={lesson?.check_prompt ?? ""} />
          <TextArea label="Choices, one per line" name="check_choices" rows={3} defaultValue={lesson?.check_choices?.join("\n") ?? ""} />
          <div className="max-w-48">
            <Field
              label="Correct choice (number)"
              name="check_answer"
              type="number"
              min={1}
              max={6}
              defaultValue={lesson?.check_answer != null ? lesson.check_answer + 1 : ""}
            />
          </div>
          <TextArea label="Why it's right (shown after they answer)" name="check_explanation" rows={2} defaultValue={lesson?.check_explanation ?? ""} />
        </div>
      </details>
      <div className="flex gap-2">
        <Button type="submit">{lesson ? "Save lesson" : "Add lesson"}</Button>
        {lesson && (
          <Button type="submit" variant="danger" formAction={deleteLesson}>
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}

function QuestionForm({
  classId,
  question,
  correct,
  next,
}: {
  classId: string;
  question?: TrainingQuestion;
  correct?: number;
  next: number;
}) {
  return (
    <form action={saveQuestion} className="grid gap-3">
      <input type="hidden" name="id" value={classId} />
      {question && <input type="hidden" name="question_id" value={question.id} />}
      <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
        <Field label="Question" name="prompt" defaultValue={question?.prompt} required />
        <Field label="Order" name="position" type="number" defaultValue={question?.position ?? next} />
      </div>
      <TextArea
        label="Choices, one per line"
        name="choices"
        rows={4}
        defaultValue={question?.choices.join("\n")}
        required
      />
      <div className="max-w-48">
        <Field
          label="Correct choice (number)"
          name="correct"
          type="number"
          min={1}
          max={6}
          defaultValue={correct !== undefined ? correct + 1 : ""}
          required
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit">{question ? "Save question" : "Add question"}</Button>
        {question && (
          <Button type="submit" variant="danger" formAction={deleteQuestion}>
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}

export default async function EditClassPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: cls }, { data: lessons }, { data: questions }, { data: quals }, { data: others }, { data: certs }] =
    await Promise.all([
      supabase.from("training_classes").select("*").eq("id", id).maybeSingle(),
      supabase.from("training_lessons").select("*").eq("class_id", id).order("position").order("created_at"),
      supabase.from("training_questions").select("*").eq("class_id", id).order("position").order("created_at"),
      supabase.from("qualifications").select("id, name").order("name"),
      supabase.from("training_classes").select("id, title").neq("id", id).order("sort_order"),
      supabase.from("certifications").select("id, name").order("name"),
    ]);
  if (!cls) notFound();
  const c = cls as TrainingClass;
  const lessonList = (lessons ?? []) as TrainingLesson[];
  const questionList = (questions ?? []) as TrainingQuestion[];
  const { data: answers } = await supabase
    .from("training_answers")
    .select("question_id, correct_index")
    .in("question_id", questionList.map((q) => q.id));
  const correctById = new Map((answers ?? []).map((a) => [a.question_id as string, a.correct_index as number]));
  const nextLesson = Math.max(0, ...lessonList.map((l) => l.position)) + 1;
  const pictures = await pictureUrls(supabase, lessonList.map((l) => l.image_path));
  const canCreate = canCreatePictures();
  const nextQuestion = Math.max(0, ...questionList.map((q) => q.position)) + 1;

  return (
    <>
      <Link href="/training/manage" className="mb-2 inline-block text-sm text-blue-700 underline">← Manage classes</Link>
      <PageHeader title={`Edit: ${c.title}`}>
        <Link href={`/training/${c.id}`} className="text-sm text-blue-700 underline">
          {c.status === "draft" ? "Preview and approve" : "View class"}
        </Link>
      </PageHeader>
      <Status searchParams={searchParams} />
      {c.status === "approved" && (
        <p className="mb-4 rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-900">
          This class is approved, so changes you save here show to the team right away.
        </p>
      )}

      <Card className="mb-6">
        <h2 className="mb-3 font-semibold">Class details</h2>
        <form action={updateClass} className="grid gap-3">
          <input type="hidden" name="id" value={c.id} />
          <Field label="Title" name="title" defaultValue={c.title} required />
          <TextArea label="Summary" name="summary" rows={2} defaultValue={c.summary ?? ""} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Minutes to complete" name="minutes" type="number" min={1} defaultValue={c.minutes ?? ""} />
            <Field label="Passing score (%)" name="pass_percent" type="number" min={1} max={100} defaultValue={c.pass_percent} />
            <Field label="Order in the list" name="sort_order" type="number" defaultValue={c.sort_order} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Select label="Certification earned" name="certification_id" defaultValue={c.certification_id ?? ""}>
              <option value="">None</option>
              {(certs ?? []).map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name}
                </option>
              ))}
            </Select>
            <Select label="Also counts as qualification" name="qualification_id" defaultValue={c.qualification_id ?? ""}>
              <option value="">None</option>
              {(quals ?? []).map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name}
                </option>
              ))}
            </Select>
            <Select label="Must pass first" name="prerequisite_id" defaultValue={c.prerequisite_id ?? ""}>
              <option value="">Nothing</option>
              {(others ?? []).map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </Select>
          </div>
          <p className="text-xs text-slate-500">
            Passing adds the certification to the member&apos;s My Certifications. The qualification is only needed if a
            position requires it. Add or rename them under{" "}
            <Link href="/admin/certifications" className="underline">Admin › Certifications</Link> and{" "}
            <Link href="/admin/qualifications" className="underline">Admin › Qualifications</Link>.
          </p>
          <div className="flex gap-2">
            <Button type="submit">Save details</Button>
            <Button type="submit" variant="danger" formAction={deleteClass}>
              Delete class
            </Button>
          </div>
        </form>
      </Card>

      <Card className="mb-6">
        <h2 className="mb-2 font-semibold">Slide pictures</h2>
        {canCreate ? (
          <>
            <p className="mb-3 text-sm text-slate-600">
              The app can create a picture for each slide that fits what it covers, in the same friendly style. You can
              replace any picture below with a new one or your own.
            </p>
            <CreateAllPictures lessonIds={lessonList.filter((l) => !l.image_path).map((l) => l.id)} />
          </>
        ) : (
          <p className="text-sm text-slate-600">
            Upload a picture on any lesson below. To have the app create pictures for every slide, add an Anthropic API
            key as <code>ANTHROPIC_API_KEY</code> (or an OpenAI key as <code>OPENAI_API_KEY</code>) in the app&apos;s
            Vercel settings.
          </p>
        )}
      </Card>

      <h2 className="mb-2 font-semibold">Lessons</h2>
      <div className="mb-6 space-y-4">
        {lessonList.map((lesson) => (
          <Card key={lesson.id}>
            <LessonForm
              classId={c.id}
              lesson={lesson}
              next={nextLesson}
              pictureUrl={lesson.image_path ? pictures[lesson.image_path] : undefined}
              canCreate={canCreate}
            />
          </Card>
        ))}
        <Card>
          <h3 className="mb-3 font-medium">Add a lesson</h3>
          <LessonForm classId={c.id} next={nextLesson} canCreate={canCreate} />
        </Card>
      </div>

      <h2 className="mb-2 font-semibold">Quiz questions</h2>
      <div className="space-y-4">
        {questionList.map((q) => (
          <Card key={q.id}>
            <QuestionForm classId={c.id} question={q} correct={correctById.get(q.id)} next={nextQuestion} />
          </Card>
        ))}
        <Card>
          <h3 className="mb-3 font-medium">Add a question</h3>
          <QuestionForm classId={c.id} next={nextQuestion} />
        </Card>
      </div>
    </>
  );
}
