import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PhotoViewer } from "@/components/PhotoViewer";
import { Status } from "@/components/Status";
import { Button, Card, PageHeader, TextArea } from "@/components/ui";
import { readWatchListForm, WatchListForm } from "@/components/WatchListForm";
import { getCurrentUser, requirePermission } from "@/lib/auth";
import { formatDate, formatDateTime, localDate } from "@/lib/dates";
import { finish, text, type SearchParams } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { BUCKET, photoUrls, STATUS_LABELS, uploadPhoto, type WatchListEntry, type WatchListNote } from "@/lib/watchList";

async function requireWatchListAccess() {
  const user = await getCurrentUser();
  if (!user.can("view_watch_list") && !user.can("manage_watch_list")) redirect("/");
  return user;
}

async function addNote(formData: FormData) {
  "use server";
  await requireWatchListAccess();
  const entryId = String(formData.get("entry_id"));
  const body = text(formData, "body");
  if (!body) finish(`/watch-list/${entryId}`, { message: "Type a note before saving." });
  const supabase = await createClient();
  const { error } = await supabase.from("watch_list_notes").insert({ entry_id: entryId, body });
  finish(`/watch-list/${entryId}`, error, "Note added.");
}

async function editNote(formData: FormData) {
  "use server";
  const user = await requireWatchListAccess();
  const entryId = String(formData.get("entry_id"));
  const body = text(formData, "body");
  if (!body)
    finish(`/watch-list/${entryId}`, {
      message: "A note can't be empty. Use Delete to remove it.",
    });
  const supabase = await createClient();
  const { error } = await supabase
    .from("watch_list_notes")
    .update({ body, updated_by: user.id })
    .eq("id", String(formData.get("id")));
  finish(`/watch-list/${entryId}`, error, "Note saved.");
}

async function deleteNote(formData: FormData) {
  "use server";
  await requireWatchListAccess();
  const entryId = String(formData.get("entry_id"));
  const supabase = await createClient();
  const { error } = await supabase
    .from("watch_list_notes")
    .delete()
    .eq("id", String(formData.get("id")));
  finish(`/watch-list/${entryId}`, error, "Note deleted.");
}

async function updateEntry(formData: FormData) {
  "use server";
  await requirePermission("manage_watch_list");
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const photo = await uploadPhoto(supabase, formData);
  if (photo.error) finish(`/watch-list/${id}`, photo.error);

  const { data: old } = await supabase.from("watch_list").select("photo_path").eq("id", id).single();
  const { error } = await supabase
    .from("watch_list")
    .update({
      ...readWatchListForm(formData),
      ...(photo.path ? { photo_path: photo.path } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (!error && photo.path && old?.photo_path) await supabase.storage.from(BUCKET).remove([old.photo_path]);
  finish(`/watch-list/${id}`, error);
}

async function setArchived(formData: FormData) {
  "use server";
  await requirePermission("manage_watch_list");
  const id = String(formData.get("id"));
  const archived = formData.get("archived") === "true";
  const supabase = await createClient();
  const { error } = await supabase.from("watch_list").update({ archived }).eq("id", id);
  finish(`/watch-list/${id}`, error, archived ? "Moved to the archive." : "Back on the current list.");
}

async function deleteEntry(formData: FormData) {
  "use server";
  await requirePermission("manage_watch_list");
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { data: old } = await supabase.from("watch_list").select("photo_path").eq("id", id).single();
  const { error } = await supabase.from("watch_list").delete().eq("id", id);
  if (error) finish(`/watch-list/${id}`, error);
  if (old?.photo_path) await supabase.storage.from(BUCKET).remove([old.photo_path]);
  redirect("/watch-list?saved=Entry+deleted.");
}

export default async function WatchListEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user.can("view_watch_list") && !user.can("manage_watch_list")) redirect("/");
  const canManage = user.can("manage_watch_list");

  const supabase = await createClient();
  const [{ data }, { data: noteRows }] = await Promise.all([
    supabase.from("watch_list").select("*, profiles(full_name)").eq("id", id).maybeSingle(),
    supabase
      .from("watch_list_notes")
      .select(
        "*, author:profiles!watch_list_notes_created_by_fkey(full_name), editor:profiles!watch_list_notes_updated_by_fkey(full_name)",
      )
      .eq("entry_id", id)
      .order("created_at"),
  ]);
  if (!data) notFound();
  const notes = (noteRows ?? []) as WatchListNote[];
  const entry = data as WatchListEntry;
  const photos = await photoUrls(supabase, [entry.photo_path]);
  const photo = entry.photo_path ? photos[entry.photo_path] : undefined;
  const status = STATUS_LABELS[entry.status];

  const details: [string, string | null][] = [
    ["Also known as", entry.aliases],
    ["Description", entry.description],
    ["Reason", entry.reason],
    ["Vehicle", entry.vehicle],
    ["What to do if seen", entry.instructions],
    ["Banned until", entry.banned_until && formatDate(entry.banned_until)],
  ];

  return (
    <>
      <Link href="/watch-list" className="mb-2 inline-block text-sm text-blue-700 underline">
        ← Watch list
      </Link>
      <PageHeader title={entry.full_name} />
      <Status searchParams={searchParams} />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row">
              {photo ? (
                <PhotoViewer src={photo} alt={entry.full_name} className="w-full max-w-48 rounded object-cover" />
              ) : (
                <div className="flex h-48 w-36 items-center justify-center rounded bg-slate-100 text-sm text-slate-400">
                  No photo
                </div>
              )}
              <div className="space-y-2">
                <span className={`inline-block rounded px-2 py-0.5 text-sm font-medium ${status.className}`}>{status.label}</span>
                {entry.archived && <span className="ml-2 inline-block rounded bg-slate-200 px-2 py-0.5 text-sm">Archived</span>}
                <dl className="space-y-2 text-sm">
                  {details
                    .filter(([, v]) => v)
                    .map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-slate-500">{label}</dt>
                        <dd className="whitespace-pre-wrap">{value}</dd>
                      </div>
                    ))}
                </dl>
                <p className="text-xs text-slate-500">
                  Added {formatDate(localDate(entry.created_at), "short")}
                  {entry.profiles?.full_name && ` by ${entry.profiles.full_name}`}
                </p>
              </div>
            </div>
          </Card>
          <NotesCard entryId={entry.id} notes={notes} userId={user.id} isAdmin={user.isAdmin} />
        </div>
        {canManage && (
          <div className="space-y-6">
            <Card>
              <h2 className="mb-3 font-semibold">Edit</h2>
              <WatchListForm action={updateEntry} entry={entry} submitLabel="Save changes" />
            </Card>
            <Card>
              <form className="flex flex-wrap gap-2">
                <input type="hidden" name="id" value={entry.id} />
                <input type="hidden" name="archived" value={String(!entry.archived)} />
                <Button type="submit" variant="secondary" formAction={setArchived}>
                  {entry.archived ? "Restore to current list" : "Archive (no longer a concern)"}
                </Button>
                <Button type="submit" variant="danger" formAction={deleteEntry}>
                  Delete permanently
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}

function NotesCard({
  entryId,
  notes,
  userId,
  isAdmin,
}: {
  entryId: string;
  notes: WatchListNote[];
  userId: string;
  isAdmin: boolean;
}) {
  return (
    <Card>
      <h2 className="mb-1 font-semibold">Notes</h2>
      <p className="mb-3 text-sm text-slate-600">
        Record sightings, what happened, or anything else the team should know. Anyone on the team can add a note; the person who
        wrote it and admins can edit or delete it.
      </p>
      {notes.length === 0 ? (
        <p className="mb-4 text-sm text-slate-500">No notes yet.</p>
      ) : (
        <ul className="mb-4 divide-y divide-slate-200 rounded-md border border-slate-200">
          {notes.map((note) => (
            <li key={note.id} className="space-y-1 px-3 py-2">
              <p className="text-xs text-slate-500">
                {note.author?.full_name ?? "Former member"} · {formatDateTime(note.created_at)}
                {note.updated_at &&
                  ` · edited${note.editor ? ` by ${note.editor.full_name}` : ""} ${formatDateTime(note.updated_at)}`}
              </p>
              <p className="whitespace-pre-wrap text-sm">{note.body}</p>
              {(isAdmin || note.created_by === userId) && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-blue-700 underline">Edit</summary>
                  <form className="mt-2 space-y-2">
                    <input type="hidden" name="id" value={note.id} />
                    <input type="hidden" name="entry_id" value={entryId} />
                    <TextArea label="Note" name="body" rows={4} maxLength={5000} required defaultValue={note.body} />
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" variant="secondary" formAction={editNote} pendingLabel="Saving…">
                        Save note
                      </Button>
                      <Button type="submit" variant="danger" formAction={deleteNote} formNoValidate>
                        Delete
                      </Button>
                    </div>
                  </form>
                </details>
              )}
            </li>
          ))}
        </ul>
      )}
      <form action={addNote} className="space-y-2">
        <input type="hidden" name="entry_id" value={entryId} />
        <TextArea
          label="Add a note"
          name="body"
          rows={3}
          maxLength={5000}
          required
          placeholder="e.g. Seen in the north parking lot on Sunday 10/27 around 10:45."
        />
        <Button type="submit" pendingLabel="Saving…">
          Add note
        </Button>
      </form>
    </Card>
  );
}
