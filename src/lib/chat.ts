// Team chat: 'team' is the whole-team conversation; any other conversation id
// is the other member's profile id.

export const TEAM = "team";

// Chat times are shown in church time on both the server and the browser.
const TIME_ZONE = "America/Chicago";

export type ChatMessage = {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  body: string;
  created_at: string;
  /** A picture or GIF in the private 'chat' bucket. */
  image_path: string | null;
  /** The earlier message this one answers. */
  reply_to: string | null;
};

export type ChatReaction = { message_id: string; profile_id: string; emoji: string };

export const CHAT_BUCKET = "chat";
/** Pictures over this size (after shrinking photos) are turned away. GIFs aren't shrunk, so they keep moving. */
export const MAX_PICTURE_BYTES = 10 * 1024 * 1024;
/** The emojis offered when reacting to a message. */
export const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "✅"];

export type ChatMember = { id: string; name: string };

export type Conversation = {
  id: string;
  name: string;
  lastAt: string | null;
  lastBody: string | null;
  lastFromMe: boolean;
  unread: number;
};

export const MAX_MESSAGE_LENGTH = 4000;
export const MESSAGES_SHOWN = 200;

export function isMemberId(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/** Which of my conversations a message belongs in. */
export function conversationOf(message: Pick<ChatMessage, "sender_id" | "recipient_id">, me: string) {
  if (!message.recipient_id) return TEAM;
  return message.sender_id === me ? message.recipient_id : message.sender_id;
}

/** Where a picture sent in this conversation is stored. Row level security checks the same layout. */
export function picturePrefix(conversation: string, me: string) {
  return conversation === TEAM ? `team/${me}/` : `direct/${me}/${conversation}/`;
}

export function chatDay(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, weekday: "long", month: "long", day: "numeric" }).format(
    new Date(timestamp),
  );
}

export function chatTime(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, hour: "numeric", minute: "2-digit" }).format(
    new Date(timestamp),
  );
}

/** "3:05 PM" today, "Mon" this week, otherwise "Oct 12". */
export function chatWhen(timestamp: string) {
  const then = new Date(timestamp);
  const day = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(d);
  if (day(then) === day(new Date())) return chatTime(timestamp);
  const opts: Intl.DateTimeFormatOptions =
    Date.now() - then.getTime() < 6 * 86400000 ? { weekday: "short" } : { month: "short", day: "numeric" };
  return new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, ...opts }).format(then);
}
