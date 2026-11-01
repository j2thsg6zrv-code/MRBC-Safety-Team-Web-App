/** Intel: reports the intelligence officer posts about what's going on. */
export const THREAT_LEVELS = {
  high: { label: "High", className: "bg-red-100 text-red-800 border-red-300" },
  medium: { label: "Medium", className: "bg-amber-100 text-amber-800 border-amber-300" },
  low: { label: "Low", className: "bg-green-100 text-green-800 border-green-300" },
} as const;

export type ThreatLevel = keyof typeof THREAT_LEVELS;

export type IntelReport = {
  id: string;
  title: string;
  description: string;
  source_url: string | null;
  threat_level: ThreatLevel;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  profiles: { full_name: string } | null;
};

/** Accepts "example.com/story" as well as a full link; null if it isn't a web address. */
export function cleanSourceUrl(value: string | null): string | null | undefined {
  if (!value) return null;
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    return url.hostname.includes(".") ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}
