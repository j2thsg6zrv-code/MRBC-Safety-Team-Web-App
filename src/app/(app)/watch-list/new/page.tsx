import Link from "next/link";
import { redirect } from "next/navigation";
import { Status } from "@/components/Status";
import { Card, PageHeader } from "@/components/ui";
import { readWatchListForm, WatchListForm } from "@/components/WatchListForm";
import { requirePermission } from "@/lib/auth";
import { finish, type SearchParams } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { uploadPhoto } from "@/lib/watchList";

async function addEntry(formData: FormData) {
  "use server";
  const user = await requirePermission("manage_watch_list");
  const supabase = await createClient();
  const photo = await uploadPhoto(supabase, formData);
  if (photo.error) finish("/watch-list/new", photo.error);

  const { data, error } = await supabase
    .from("watch_list")
    .insert({ ...readWatchListForm(formData), photo_path: photo.path, added_by: user.id })
    .select("id")
    .single();
  if (error || !data) finish("/watch-list/new", error);
  redirect(`/watch-list/${data.id}?saved=Added+to+the+watch+list.`);
}

export default async function NewWatchListPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePermission("manage_watch_list");
  return (
    <>
      <Link href="/watch-list" className="mb-2 inline-block text-sm text-blue-700 underline">← Watch list</Link>
      <PageHeader title="Add to Watch List" />
      <Status searchParams={searchParams} />
      <Card>
        <WatchListForm action={addEntry} submitLabel="Add to watch list" />
      </Card>
    </>
  );
}
