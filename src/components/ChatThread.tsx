"use client";

import Link from "next/link";
import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { deleteMessage, markRead, sendMessage, toggleReaction } from "@/app/(app)/chat/actions";
import {
  CHAT_BUCKET,
  chatDay,
  chatTime,
  MAX_MESSAGE_LENGTH,
  MAX_PICTURE_BYTES,
  MESSAGES_SHOWN,
  picturePrefix,
  QUICK_REACTIONS,
  TEAM,
  type ChatMessage,
  type ChatReaction,
} from "@/lib/chat";
import { createClient } from "@/lib/supabase/client";

type Shown = ChatMessage & { sending?: boolean; localUrl?: string };
/** A picture chosen for the next message, already shrunk if it was a big photo. */
type Picture = { blob: Blob; type: string; url: string };

export function ChatThread({
  conversation,
  title,
  subtitle,
  canSend,
  me,
  isAdmin,
  names,
  messages,
  reactions,
  pictures,
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
  reactions: ChatReaction[];
  /** Short-lived links for message pictures, keyed by storage path. */
  pictures: Record<string, string>;
  showingLatest: boolean;
}) {
  const [shown, addSending] = useOptimistic<Shown[], Shown>(messages, (list, m) => [...list, m]);
  const [shownReactions, flipReaction] = useOptimistic<ChatReaction[], { message_id: string; emoji: string }>(
    reactions,
    (list, { message_id, emoji }) => {
      const mine = (r: ChatReaction) => r.message_id === message_id && r.emoji === emoji && r.profile_id === me;
      return list.some(mine) ? list.filter((r) => !mine(r)) : [...list, { message_id, emoji, profile_id: me }];
    },
  );
  const [draft, setDraft] = useState("");
  const [picture, setPicture] = useState<Picture | null>(null);
  const [replyingTo, setReplyingTo] = useState<Shown | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const scroller = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  const input = useRef<HTMLTextAreaElement>(null);
  const filePicker = useRef<HTMLInputElement>(null);
  const isTeam = conversation === TEAM;
  const firstName = title.split(" ")[0];
  const byId = new Map(shown.map((m) => [m.id, m]));
  const nameOf = (id: string) => (id === me ? "You" : names[id] ?? "Former member");

  useEffect(() => {
    markRead(conversation);
  }, [conversation]);

  // Keep the newest message in view.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
    atBottom.current = true;
  }, [shown.length]);

  // Pictures load after the page draws, so stay at the bottom as they appear.
  function pictureLoaded() {
    const el = scroller.current;
    if (el && atBottom.current) el.scrollTop = el.scrollHeight;
  }

  async function choosePicture(file: File | null | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only pictures and GIFs can be sent in chat.");
      return;
    }
    setError(null);
    setPreparing(true);
    try {
      const ready = await preparePicture(file);
      if (ready.blob.size > MAX_PICTURE_BYTES) {
        setError("That picture is too big to send (over 10 MB).");
        return;
      }
      setPicture((old) => {
        if (old) URL.revokeObjectURL(old.url);
        return { ...ready, url: URL.createObjectURL(ready.blob) };
      });
      input.current?.focus();
    } catch {
      setError("That picture couldn't be opened. Try a JPG, PNG or GIF.");
    } finally {
      setPreparing(false);
    }
  }

  function removePicture() {
    if (picture) URL.revokeObjectURL(picture.url);
    setPicture(null);
  }

  function send() {
    const body = draft.trim();
    const pic = picture;
    const reply = replyingTo;
    if (!body && !pic) return;
    setDraft("");
    setPicture(null);
    setReplyingTo(null);
    setError(null);
    startTransition(async () => {
      addSending({
        id: `sending-${Date.now()}`,
        sender_id: me,
        recipient_id: isTeam ? null : conversation,
        body,
        created_at: new Date().toISOString(),
        image_path: pic ? "sending" : null,
        reply_to: reply?.id ?? null,
        sending: true,
        localUrl: pic?.url,
      });
      let path: string | null = null;
      if (pic) {
        path = `${picturePrefix(conversation, me)}${crypto.randomUUID()}.${extensionOf(pic.type)}`;
        const { error: uploadError } = await createClient()
          .storage.from(CHAT_BUCKET)
          .upload(path, pic.blob, { contentType: pic.type });
        if (uploadError) {
          setError("Your picture didn't upload. Please try again.");
          setDraft(body);
          setPicture(pic);
          setReplyingTo(reply);
          return;
        }
      }
      const result = await sendMessage(conversation, body, path, reply?.id ?? null);
      if (result.error) {
        setError(result.error);
        setDraft(body);
        // The upload was removed when the message failed, so choose it again.
        setPicture(pic ? { ...pic, url: URL.createObjectURL(pic.blob) } : null);
        setReplyingTo(reply);
      }
    });
    input.current?.focus();
  }

  function react(messageId: string, emoji: string) {
    setSelected(null);
    startTransition(async () => {
      flipReaction({ message_id: messageId, emoji });
      await toggleReaction(messageId, emoji);
    });
  }

  function reply(m: Shown) {
    setSelected(null);
    setReplyingTo(m);
    input.current?.focus();
  }

  function remove(id: string) {
    if (!confirm("Delete this message for everyone?")) return;
    setSelected(null);
    startTransition(() => deleteMessage(id));
  }

  function jumpTo(id: string) {
    document.getElementById(`msg-${id}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
    setFlash(id);
    setTimeout(() => setFlash((f) => (f === id ? null : f)), 1600);
  }

  return (
    <section
      className="relative flex min-h-0 flex-col bg-slate-50"
      onDragOver={(e) => {
        if (!canSend || !e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={(e) => {
        if (!canSend) return;
        e.preventDefault();
        setDragging(false);
        choosePicture(Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/")) ?? e.dataTransfer.files[0]);
      }}
    >
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <Link href="/chat" className="text-sm text-blue-700 md:hidden" aria-label="Back to conversations">
          ‹ Back
        </Link>
        <div className="min-w-0">
          <h2 className="truncate font-semibold">{title}</h2>
          <p className="truncate text-xs text-slate-500">{subtitle}</p>
        </div>
      </header>

      <div
        ref={scroller}
        onScroll={(e) => {
          const el = e.currentTarget;
          atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
      >
        {showingLatest && (
          <p className="mb-4 text-center text-xs text-slate-500">Showing the latest {MESSAGES_SHOWN} messages.</p>
        )}
        {shown.length === 0 ? (
          <p className="mt-8 text-center text-sm text-slate-500">
            {isTeam ? "No messages yet. Say hello to the team!" : `No messages yet. Send ${firstName} a message.`}
          </p>
        ) : (
          <p className="mb-2 text-center text-xs text-slate-500">
            Tap a message, or press and hold a picture, to react or reply.
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
            const select = m.sending ? undefined : () => setSelected(selected === m.id ? null : m.id);
            const pictureUrl = m.localUrl ?? (m.image_path ? pictures[m.image_path] : undefined);
            const answered = m.reply_to ? byId.get(m.reply_to) : undefined;
            const grouped = groupReactions(shownReactions.filter((r) => r.message_id === m.id));
            return (
              <li key={m.id} id={`msg-${m.id}`}>
                {newDay && (
                  <p suppressHydrationWarning className="py-3 text-center text-xs font-medium text-slate-500">
                    {chatDay(m.created_at)}
                  </p>
                )}
                <div
                  className={`flex flex-col gap-1 rounded-xl transition-colors ${mine ? "items-end" : "items-start"} ${
                    newSender && !newDay ? "pt-2" : ""
                  } ${flash === m.id ? "bg-amber-100" : ""}`}
                >
                  {newSender && (
                    <p suppressHydrationWarning className="-mb-0.5 px-1 text-xs text-slate-500">
                      {mine || !isTeam ? "" : `${names[m.sender_id] ?? "Former member"} · `}
                      {chatTime(m.created_at)}
                    </p>
                  )}
                  {m.reply_to && (
                    <button
                      type="button"
                      onClick={() => answered && jumpTo(answered.id)}
                      className="max-w-[85%] truncate rounded-xl border-l-4 border-slate-300 bg-slate-100 px-3 py-1 text-left text-xs text-slate-600 md:max-w-[70%]"
                    >
                      {answered ? (
                        <>
                          <span className="font-medium">↩ {nameOf(answered.sender_id)}:</span> {snippet(answered)}
                        </>
                      ) : (
                        "↩ Replying to an earlier message"
                      )}
                    </button>
                  )}
                  {m.image_path &&
                    (pictureUrl ? (
                      <ChatPicture
                        src={pictureUrl}
                        alt={`Picture from ${mine ? "you" : names[m.sender_id] ?? "a former member"}`}
                        dim={!!m.sending}
                        onLoad={pictureLoaded}
                        onHold={select}
                      />
                    ) : (
                      <p className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                        Picture unavailable
                      </p>
                    ))}
                  {m.body && (
                    <Bubble
                      onSelect={select}
                      className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-left md:max-w-[70%] ${
                        mine ? "bg-blue-700 text-onaccent" : "border border-slate-200 bg-white text-slate-900"
                      } ${m.sending ? "opacity-60" : ""} ${isOnlyEmoji(m.body) ? "text-3xl leading-tight" : ""}`}
                    >
                      {m.body}
                    </Bubble>
                  )}
                  {grouped.length > 0 && (
                    <div className="flex flex-wrap gap-1 px-1">
                      {grouped.map((g) => {
                        const reacted = g.people.includes(me);
                        return (
                          <button
                            key={g.emoji}
                            type="button"
                            onClick={() => react(m.id, g.emoji)}
                            title={g.people.map(nameOf).join(", ")}
                            aria-label={`${g.emoji} from ${g.people.map(nameOf).join(", ")}. ${reacted ? "Tap to take yours back." : "Tap to add yours."}`}
                            aria-pressed={reacted}
                            className={`rounded-full border px-2 py-0.5 text-sm ${
                              reacted ? "border-blue-600 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-700"
                            }`}
                          >
                            {g.emoji} {g.people.length > 1 && <span className="text-xs">{g.people.length}</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {m.sending && <p className="px-1 text-xs text-slate-500">Sending…</p>}
                  {selected === m.id && (
                    <div className="flex max-w-full flex-wrap items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                      {QUICK_REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => react(m.id, emoji)}
                          className="flex h-10 w-10 items-center justify-center rounded-full text-xl hover:bg-slate-100"
                          aria-label={`React with ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                      {canSend && (
                        <button
                          type="button"
                          onClick={() => reply(m)}
                          className="h-10 rounded-full px-3 text-sm font-medium text-blue-700 hover:bg-slate-100"
                        >
                          Reply
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => remove(m.id)}
                          className="h-10 rounded-full px-3 text-sm text-red-700 hover:bg-slate-100"
                        >
                          Delete
                        </button>
                      )}
                    </div>
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
          {replyingTo && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border-l-4 border-blue-600 bg-slate-50 px-3 py-1.5 text-sm">
              <p className="min-w-0 flex-1 truncate text-slate-700">
                <span className="font-medium">Replying to {nameOf(replyingTo.sender_id)}:</span> {snippet(replyingTo)}
              </p>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl text-slate-500 hover:bg-slate-200"
                aria-label="Cancel reply"
              >
                ×
              </button>
            </div>
          )}
          {(picture || preparing) && (
            <div className="mb-2 flex items-center gap-2">
              {picture ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={picture.url} alt="Picture to send" className="h-20 max-w-40 rounded-lg border border-slate-200 object-cover" />
                  <button
                    type="button"
                    onClick={removePicture}
                    className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-lg leading-none text-white"
                    aria-label="Remove picture"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Getting the picture ready…</p>
              )}
            </div>
          )}
          <div className="flex items-end gap-2">
            <input
              ref={filePicker}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                choosePicture(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => filePicker.current?.click()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
              aria-label="Add a picture or GIF"
              title="Add a picture or GIF"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="9" cy="10" r="2" />
                <path d="m21 16-5-5-9 9" />
              </svg>
            </button>
            <label className="sr-only" htmlFor="chat-message">Message</label>
            <textarea
              id="chat-message"
              ref={input}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onPaste={(e) => {
                const file = Array.from(e.clipboardData.files).find((f) => f.type.startsWith("image/"));
                if (!file) return;
                e.preventDefault();
                choosePicture(file);
              }}
              onKeyDown={(e) => {
                // Enter sends; Shift+Enter starts a new line.
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
                if (e.key === "Escape" && replyingTo) setReplyingTo(null);
              }}
              rows={1}
              maxLength={MAX_MESSAGE_LENGTH}
              placeholder={picture ? "Add a message (optional)" : isTeam ? "Message the whole team" : `Message ${firstName}`}
              className="max-h-40 min-h-11 min-w-0 flex-1 resize-none rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-base [field-sizing:content] focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={(!draft.trim() && !picture) || preparing}
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

      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center border-4 border-dashed border-blue-600 bg-blue-50/80 text-lg font-medium text-blue-800">
          Drop the picture to add it
        </div>
      )}
    </section>
  );
}

/** A message bubble; tap it to react, reply or delete. */
function Bubble({ onSelect, className, children }: { onSelect?: () => void; className: string; children: ReactNode }) {
  return onSelect ? (
    <button type="button" onClick={onSelect} className={`${className} cursor-pointer`}>
      {children}
    </button>
  ) : (
    <div className={className}>{children}</div>
  );
}

/**
 * A picture in the chat. Tap to see it full screen; press and hold (or
 * right-click) to react, reply or delete.
 */
function ChatPicture({
  src,
  alt,
  dim,
  onLoad,
  onHold,
}: {
  src: string;
  alt: string;
  dim: boolean;
  onLoad: () => void;
  onHold?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const held = useRef(false);
  const start = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  return (
    <>
      <button
        type="button"
        onPointerDown={(e) => {
          held.current = false;
          start.current = { x: e.clientX, y: e.clientY };
          if (!onHold) return;
          timer.current = setTimeout(() => {
            held.current = true;
            onHold();
          }, 500);
        }}
        onPointerMove={(e) => {
          if (Math.abs(e.clientX - start.current.x) + Math.abs(e.clientY - start.current.y) > 10) cancel();
        }}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onContextMenu={(e) => {
          if (!onHold) return;
          e.preventDefault();
          cancel();
          if (!held.current) onHold();
          held.current = true;
        }}
        onClick={() => {
          if (held.current) held.current = false;
          else setOpen(true);
        }}
        className="max-w-[85%] cursor-zoom-in select-none overflow-hidden rounded-2xl border border-slate-200 bg-white [-webkit-touch-callout:none] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:max-w-xs"
        aria-label={`${alt}. Tap to see it larger.`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          onLoad={onLoad}
          draggable={false}
          className={`block max-h-72 w-auto max-w-full object-contain ${dim ? "opacity-60" : ""}`}
        />
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out flex-col items-center justify-center bg-black/90 p-4"
        >
          <button
            type="button"
            autoFocus
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-3xl leading-none text-white hover:bg-white/25"
            aria-label="Close picture"
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="max-h-[85vh] max-w-full rounded object-contain shadow-2xl" />
          <p className="mt-3 text-center text-sm text-white">{alt}</p>
        </div>
      )}
    </>
  );
}

function groupReactions(list: ChatReaction[]) {
  const groups = new Map<string, string[]>();
  for (const r of list) groups.set(r.emoji, [...(groups.get(r.emoji) ?? []), r.profile_id]);
  return [...groups].map(([emoji, people]) => ({ emoji, people }));
}

/** A one-line preview of a message, for replies. */
function snippet(m: Pick<ChatMessage, "body" | "image_path">) {
  const text = m.body.replace(/\s+/g, " ").trim();
  if (!text) return m.image_path ? "📷 Picture" : "";
  return (m.image_path ? "📷 " : "") + (text.length > 80 ? `${text.slice(0, 80)}…` : text);
}

/** Short messages that are only emojis show bigger, like on a phone. */
function isOnlyEmoji(text: string) {
  const t = text.replace(/\s/g, "");
  return t.length > 0 && t.length <= 24 && /^(?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|\p{Regional_Indicator}|‍|️)+$/u.test(t);
}

function extensionOf(type: string) {
  return { "image/gif": "gif", "image/png": "png", "image/webp": "webp" }[type] ?? "jpg";
}

/**
 * Gets a picture ready to send. GIFs go as they are so they keep moving.
 * Photos are shrunk to at most 1600 pixels across, since phone photos are
 * often 5 MB or more; small JPG, PNG and WebP pictures are left alone.
 */
async function preparePicture(file: File): Promise<{ blob: Blob; type: string }> {
  if (file.type === "image/gif") return { blob: file, type: file.type };
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const MAX = 1600;
    const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
    const keepable = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    if (keepable && scale === 1 && file.size <= 1.5 * 1024 * 1024) return { blob: file, type: file.type };
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No canvas");
    ctx.fillStyle = "#fff"; // see-through parts of a PNG would otherwise turn black
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) throw new Error("Couldn't shrink the picture");
    return { blob, type: "image/jpeg" };
  } finally {
    URL.revokeObjectURL(url);
  }
}
