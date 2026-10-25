import Link from "next/link";
import { formatDate } from "@/lib/dates";
import { STATUS_LABELS, type WatchListEntry } from "@/lib/watchList";

export function WatchListCard({ entry, photoUrl }: { entry: WatchListEntry; photoUrl?: string }) {
  const status = STATUS_LABELS[entry.status];
  return (
    <Link
      href={`/watch-list/${entry.id}`}
      className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:border-blue-400"
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt={entry.full_name} className="h-24 w-20 shrink-0 rounded object-cover" />
      ) : (
        <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded bg-slate-100 text-xs text-slate-400">
          No photo
        </div>
      )}
      <div className="min-w-0">
        <p className="font-semibold">{entry.full_name}</p>
        <span className={`mt-0.5 inline-block rounded px-2 py-0.5 text-xs font-medium ${status.className}`}>
          {status.label}
          {entry.banned_until && ` until ${formatDate(entry.banned_until, "short")}`}
        </span>
        {entry.description && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{entry.description}</p>}
      </div>
    </Link>
  );
}
