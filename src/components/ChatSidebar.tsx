"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { chatWhen, TEAM, type Conversation } from "@/lib/chat";

export function ChatSidebar({ conversations }: { conversations: Conversation[] }) {
  const pathname = usePathname();
  const inThread = pathname !== "/chat";

  return (
    <aside
      className={`${inThread ? "hidden md:flex" : "flex"} min-h-0 flex-col border-slate-200 bg-white md:border-r`}
    >
      <h1 className="border-b border-slate-200 px-4 py-4 text-xl font-semibold">Team Chat</h1>
      <ul className="min-h-0 flex-1 overflow-y-auto">
        {conversations.map((c, i) => {
          const active = pathname === `/chat/${c.id}`;
          return (
            <li key={c.id}>
              {i === 1 && (
                <p className="px-4 pb-1 pt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Message one person
                </p>
              )}
              <Link
                href={`/chat/${c.id}`}
                className={`flex items-center gap-3 px-4 py-3 ${active ? "bg-blue-50" : "hover:bg-slate-50"}`}
              >
                <span
                  aria-hidden
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    c.id === TEAM ? "bg-blue-700 text-onaccent" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {c.id === TEAM ? "All" : initials(c.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className={`truncate ${c.unread ? "font-semibold" : "font-medium"}`}>{c.name}</span>
                    {c.lastAt && <span suppressHydrationWarning className="shrink-0 text-xs text-slate-500">{chatWhen(c.lastAt)}</span>}
                  </span>
                  <span className="flex items-center justify-between gap-2">
                    <span className={`truncate text-sm ${c.unread ? "text-slate-800" : "text-slate-500"}`}>
                      {c.lastBody ? `${c.lastFromMe ? "You: " : ""}${c.lastBody}` : c.id === TEAM ? "Say hello to everyone" : "No messages yet"}
                    </span>
                    {c.unread > 0 && (
                      <span className="shrink-0 rounded-full bg-blue-700 px-2 py-0.5 text-xs font-semibold text-onaccent">
                        {c.unread}
                        <span className="sr-only"> unread</span>
                      </span>
                    )}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}
