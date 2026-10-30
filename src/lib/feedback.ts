/** Bugs & Requests: what members send in, and where an admin has got to with it. */
export const FEEDBACK_KINDS = {
  bug: { label: "Problem", className: "bg-red-100 text-red-800" },
  idea: { label: "Idea", className: "bg-amber-100 text-amber-800" },
} as const;

export const FEEDBACK_STATUSES = {
  new: { label: "New", className: "bg-blue-100 text-blue-800" },
  planned: { label: "Planned", className: "bg-purple-100 text-purple-800" },
  in_progress: { label: "Being worked on", className: "bg-amber-100 text-amber-800" },
  done: { label: "Done", className: "bg-green-100 text-green-800" },
  wont_fix: { label: "Not planned", className: "bg-slate-200 text-slate-700" },
} as const;

export type FeedbackKind = keyof typeof FEEDBACK_KINDS;
export type FeedbackStatus = keyof typeof FEEDBACK_STATUSES;

/** Statuses that still need something done. */
export const OPEN_STATUSES: FeedbackStatus[] = ["new", "planned", "in_progress"];

export type Feedback = {
  id: string;
  kind: FeedbackKind;
  title: string;
  details: string | null;
  page: string | null;
  status: FeedbackStatus;
  admin_note: string | null;
  submitted_by: string | null;
  created_at: string;
  updated_at: string;
  profiles: { full_name: string } | null;
};
