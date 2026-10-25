/** When someone interested in joining would like a call back. */
export const BEST_TIMES = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "evening", label: "Evening" },
] as const;

export type JoinInterest = {
  id: string;
  name: string;
  phone: string;
  email: string;
  best_time: (typeof BEST_TIMES)[number]["key"];
  contacted_at: string | null;
  created_at: string;
};

export function bestTimeLabel(key: string): string {
  return BEST_TIMES.find((t) => t.key === key)?.label ?? key;
}
