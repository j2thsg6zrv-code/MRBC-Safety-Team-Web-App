"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useLayoutEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { deleteMessage, markRead, sendMessage } from "@/app/(app)/chat/actions";
import { chatDay, chatTime, MAX_MESSAGE_LENGTH, MESSAGES_SHOWN, TEAM, type ChatMessage } from "@/lib/chat";

type Shown = ChatMessage & { sending?: boolean };

export function ChatThread({
  conversation,
  title,
  subtitle,
  canSend,
  me,
  isAdmin,
  names,
  messages,
  showingLatest,
}: {
  conversation: string;
  title: string;
  subtitle: string;
  canSend: boolean;
  me: string;
  isAdmin: boolean;
  names: Record<string, string>;
  messages: ChatMessage[];
  showingLatest: boolean;
}) {
  const [shown, addSending] = useOptimistic<Shown[], Shown>(messages, (list, m) => [...list, m]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const isTeam = conversation === TEAM;

  useEffect(() => {
    markRead(conversation);
  }, [conversation]);

  // Keep the newest message in view.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown.length]);

  function send() {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    setError(null);
    startTransition(async () => {
      addSending({
        id: `sending-${Date.now()}`,
        sender_id: me,
        recipient_id: isTeam ? null : conversation,
        body,
        created_at: new Date().toISOString(),
        sending: true,
      });
      const result = await sendMessage(conversation, body);
      if (result.error) {
        setError(result.error);
        setDraft(body);
      }
    });
    input.current?.focus();
  }

  function remove(id: string) {
    if (!confirm("Delete this message for everyone?")) return;
    setSelected(null);
    startTransition(() => deleteMessage(id));
  }

  return (
    <section className="flex min-h-0 flex-col bg-slate-50">
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <Link href="/chat" className="text-sm text-blue-700 md:hidden" aria-label="Back to conversations">
          ‹ Back
        </Link>
        <div className="min-w-0">
          <h2 className="truncate font-semibold">{title}</h2>
          <p className="truncate text-xs text-slate-500">{subtitle}</p>
        </div>
      </header>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {showingLatest && (
          <p className="mb-4 text-center text-xs text-slate-500">Showing the latest {MESSAGES_SHOWN} messages.</p>
        )}
        {shown.length === 0 && (
          <p className="mt-8 text-center text-sm text-slate-500">
            {isTeam ? "No messages yet. Say hello to the team!" : `No messages yet. Send ${title.split(" ")[0]} a message.`}
          </p>
        )}
        <ol className="space-y-1">
          {shown.map((m, i) => {
            const prev = shown[i - 1];
            const mine = m.sender_id === me;
            const newDay = !prev || chatDay(prev.created_at) !== chatDay(m.created_at);
            const newSender = newDay || prev.sender_id !== m.sender_id ||
              new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() > 10 * 60000;
            const canDelete = !m.sending && (mine || (isTeam && isAdmin));
            return (
              <li key={m.id}>
                {newDay && (
                  <p suppressHydrationWarning className="py-3 text-center text-xs font-medium text-slate-500">
                    {chatDay(m.created_at)}
                  </p>
                )}
                <div className={`flex flex-col ${mine ? "items-end" : "items-start"} ${newSender && !newDay ? "pt-2" : ""}`}>
                  {newSender && (
                    <p suppressHydrationWarning className="mb-0.5 px-1 text-xs text-slate-500">
                      {mine || !isTeam ? "" : `${names[m.sender_id] ?? "Former member"} · `}
                      {chatTime(m.created_at)}
                    </p>
                  )}
                  <Bubble
                    onSelect={canDelete ? () => setSelected(selected === m.id ? null : m.id) : undefined}
                    className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-left md:max-w-[70%] ${
                      mine ? "bg-blue-700 text-onaccent" : "border border-slate-200 bg-white text-slate-900"
                    } ${m.sending ? "opacity-60" : ""}`}
                  >
                    {m.body}
                  </Bubble>
                  {m.sending && <p className="px-1 text-xs text-slate-500">Sending…</p>}
                  {selected === m.id && (
                    <button type="button" onClick={() => remove(m.id)} className="px-1 py-1 text-xs text-red-700 underline">
                      Delete message
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {canSend ? (
        <form
          className="border-t border-slate-200 bg-white p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          {error && <p className="mb-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="flex items-end gap-2">
            <label className="sr-only" htmlFor="chat-message">Message</label>
            <textarea
              id="chat-message"
              ref={input}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                // Enter sends; Shift+Enter starts a new line.
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              maxLength={MAX_MESSAGE_LENGTH}
              placeholder={isTeam ? "Message the whole team" : `Message ${title.split(" ")[0]}`}
              className="max-h-40 min-h-11 flex-1 resize-none rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-base [field-sizing:content] focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="h-11 rounded-full bg-blue-700 px-5 font-medium text-onaccent hover:brightness-90 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      ) : (
        <p className="border-t border-slate-200 bg-white p-3 text-center text-sm text-slate-500">
          You can&apos;t send messages to someone who is no longer an active member.
        </p>
      )}
    </section>
  );
}

/** A message bubble; your own can be tapped to show the delete button. */
function Bubble({ onSelect, className, children }: { onSelect?: () => void; className: string; children: ReactNode }) {
  return onSelect ? (
    <button type="button" onClick={onSelect} className={`${className} cursor-pointer`}>
      {children}
    </button>
  ) : (
    <div className={className}>{children}</div>
  );
}
