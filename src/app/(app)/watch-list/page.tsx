import Link from "next/link";
import { redirect } from "next/navigation";
import { Status } from "@/components/Status";
import { Card, PageHeader } from "@/components/ui";
import { WatchListCard } from "@/components/WatchListCard";
import { getCurrentUser } from "@/lib/auth";
import { photoUrls, type WatchListEntry } from "@/lib/watchList";
import { createClient } from "@/lib/supabase/server";

export default async function WatchListPage({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string; saved?: string; error?: string }>;
}) {
  const { archived } = await searchParams;
  const user = await getCurrentUser();
  if (!user.can("view_watch_list") && !user.can("manage_watch_list")) redirect("/");

  const supabase = await createClient();
  const { data } = await supabase
    .from("watch_list")
    .select("*")
    .eq("archived", !!archived)
    .order("status")
    .order("full_name");
  const entries = (data ?? []) as WatchListEntry[];
  const photos = await photoUrls(supabase, entries.map((e) => e.photo_path));

  return (
    <>
      <PageHeader title={archived ? "Watch List (archived)" : "Watch List"}>
        <div className="flex gap-2">
          <Link
            href={archived ? "/watch-list" : "/watch-list?archived=1"}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            {archived ? "Current list" : "Archived"}
          </Link>
          {user.can("manage_watch_list") && (
            <Link href="/watch-list/new" className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-onaccent hover:brightness-90">
              Add person
            </Link>
          )}
        </div>
      </PageHeader>
      <p className="mb-4 text-sm text-slate-600">
        Confidential. For safety team use only. Please don&apos;t share screenshots outside the team.
      </p>
      <Status searchParams={searchParams} />
      {entries.length === 0 ? (
        <Card><p className="text-slate-600">Nobody is on the {archived ? "archived " : ""}list.</p></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {entries.map((e) => <WatchListCard key={e.id} entry={e} photoUrl={e.photo_path ? photos[e.photo_path] : undefined} />)}
        </div>
      )}
    </>
  );
}
