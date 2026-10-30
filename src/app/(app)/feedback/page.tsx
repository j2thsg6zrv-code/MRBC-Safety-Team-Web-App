import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Status } from "@/components/Status";
import { Button, Card, Field, PageHeader, Select, TextArea } from "@/components/ui";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { formatDate, localDate } from "@/lib/dates";
import {
  FEEDBACK_KINDS,
  FEEDBACK_STATUSES,
  OPEN_STATUSES,
  type Feedback,
  type FeedbackKind,
  type FeedbackStatus,
} from "@/lib/feedback";
import { finish, text } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

async function send(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  const supabase = await createClient();
  const kind = String(formData.get("kind")) as FeedbackKind;
  const { error } = await supabase.from("feedback").insert({
    kind: kind in FEEDBACK_KINDS ? kind : "bug",
    title: text(formData, "title") ?? "",
    details: text(formData, "details"),
    page: text(formData, "page"),
    submitted_by: user.id,
  });
  revalidatePath("/", "layout");
  finish("/feedback", error, kind === "idea" ? "Thanks for the idea!" : "Thanks for letting us know!");
}

async function update(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  const status = String(formData.get("status")) as FeedbackStatus;
  if (!(status in FEEDBACK_STATUSES)) finish("/feedback", { message: "Choose a status." });
  const { error } = await supabase
    .from("feedback")
    .update({ status, admin_note: text(formData, "admin_note"), updated_at: new Date().toISOString() })
    .eq("id", String(formData.get("id")));
  revalidatePath("/", "layout");
  finish("/feedback", error, "Updated.");
}

async function remove(formData: FormData) {
  "use server";
  await getCurrentUser();
  const supabase = await createClient();
  // The database only lets the sender delete it while it's still new, or an admin any time.
  const { data, error } = await supabase.from("feedback").delete().eq("id", String(formData.get("id"))).select("id");
  revalidatePath("/", "layout");
  finish("/feedback", error ?? (data?.length ? null : { message: "That can't be removed now." }), "Removed.");
}

function Item({ item, isAdmin, isMine }: { item: Feedback; isAdmin: boolean; isMine: boolean }) {
  const kind = FEEDBACK_KINDS[item.kind];
  const status = FEEDBACK_STATUSES[item.status];
  return (
    <li className="space-y-2 px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium">
            <span className={`mr-2 rounded px-2 py-0.5 text-xs ${kind.className}`}>{kind.label}</span>
            {item.title}
          </p>
          <p className="text-sm text-slate-500">
            {item.profiles ? item.profiles.full_name : "Former member"} · {formatDate(localDate(item.created_at), "short")}
            {item.page && ` · ${item.page}`}
          </p>
        </div>
        <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${status.className}`}>{status.label}</span>
      </div>
      {item.details && <p className="whitespace-pre-wrap text-sm text-slate-700">{item.details}</p>}
      {item.admin_note && !isAdmin && (
        <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <span className="font-medium">Admin reply:</span> {item.admin_note}
        </p>
      )}
      {isAdmin ? (
        <div className="flex flex-wrap items-end gap-2">
          <form action={update} className="flex flex-1 flex-wrap items-end gap-2">
            <input type="hidden" name="id" value={item.id} />
            <div className="w-44">
              <Select label="Status" name="status" defaultValue={item.status}>
                {Object.entries(FEEDBACK_STATUSES).map(([key, s]) => (
                  <option key={key} value={key}>{s.label}</option>
                ))}
              </Select>
            </div>
            <div className="min-w-48 flex-1">
              <Field label="Reply (the sender and team see this)" name="admin_note" defaultValue={item.admin_note ?? ""} maxLength={2000} />
            </div>
            <Button type="submit" variant="secondary">Save</Button>
          </form>
          <form action={remove}>
            <input type="hidden" name="id" value={item.id} />
            <Button type="submit" variant="danger">Delete</Button>
          </form>
        </div>
      ) : (
        isMine &&
        item.status === "new" && (
          <form action={remove}>
            <input type="hidden" name="id" value={item.id} />
            <button type="submit" className="text-sm text-red-700 underline">Take this back</button>
          </form>
        )
      )}
    </li>
  );
}

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string; saved?: string; error?: string }>;
}) {
  const { show = "open" } = await searchParams;
  const user = await getCurrentUser();
  const supabase = await createClient();

  let query = supabase
    .from("feedback")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(300);
  if (show === "open") query = query.in("status", OPEN_STATUSES);
  else if (show === "closed") query = query.not("status", "in", `(${OPEN_STATUSES.join(",")})`);
  const { data } = await query;
  const items = (data ?? []) as unknown as Feedback[];

  const filter = (value: string, label: string) => (
    <Link
      href={`/feedback?show=${value}`}
      className={`rounded-full px-3 py-1 text-sm ${show === value ? "bg-slate-800 text-white" : "bg-white text-slate-700 hover:bg-slate-200"}`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <PageHeader title="Bugs & Requests" />
      <Status searchParams={searchParams} />
      <Card className="mb-6">
        <h2 className="mb-1 font-semibold">Report a problem or share an idea</h2>
        <p className="mb-3 text-sm text-slate-600">
          Something not working right, or an idea to make the app better? Let us know. The whole team can see what&apos;s
          been sent and where it&apos;s at.
        </p>
        <form action={send} className="space-y-3">
          <fieldset className="flex flex-wrap gap-4 text-sm">
            <legend className="mb-1 block text-sm font-medium text-slate-700">This is a…</legend>
            <label className="flex items-center gap-2">
              <input type="radio" name="kind" value="bug" defaultChecked /> Problem (something isn&apos;t working)
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="kind" value="idea" /> Idea or request
            </label>
          </fieldset>
          <Field label="Short summary" name="title" required minLength={3} maxLength={150} placeholder="e.g. Can't sign up for Sunday's door position" />
          <TextArea
            label="Details (optional)"
            name="details"
            rows={4}
            maxLength={5000}
            placeholder="What happened, what you expected, or how your idea would work."
          />
          <Field label="Which page? (optional)" name="page" maxLength={150} placeholder="e.g. Dashboard, Events, Training" />
          <Button type="submit" pendingLabel="Sending…">Send</Button>
        </form>
      </Card>

      <div className="mb-4 flex gap-2">
        {filter("open", "Open")}
        {filter("closed", "Finished")}
        {filter("all", "All")}
      </div>
      {items.length === 0 ? (
        <Card><p className="text-slate-600">{show === "open" ? "Nothing open right now." : "Nothing here yet."}</p></Card>
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <Item key={item.id} item={item} isAdmin={user.isAdmin} isMine={item.submitted_by === user.id} />
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
