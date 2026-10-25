import { cookies } from "next/headers";

export const THEMES = ["system", "light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

const COOKIE = "theme";

export function parseTheme(value: unknown): Theme {
  return THEMES.includes(value as Theme) ? (value as Theme) : "system";
}

/** The theme for this browser. Saved in a cookie so pages render in it straight away. */
export async function getTheme(): Promise<Theme> {
  return parseTheme((await cookies()).get(COOKIE)?.value);
}

export async function setThemeCookie(theme: Theme) {
  (await cookies()).set(COOKIE, theme, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}
