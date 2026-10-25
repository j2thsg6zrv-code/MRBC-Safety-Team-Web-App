/** Full address of a page on the live site, for links and QR codes shared outside the app. */
export function siteUrl(path: string): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrbc-safety-team-web-app.vercel.app";
  return `${site.replace(/\/$/, "")}${path}`;
}
