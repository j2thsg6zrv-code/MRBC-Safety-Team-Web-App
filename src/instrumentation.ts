import type { Instrumentation } from "next";

// Every error on the server (a page that crashes, a form that throws) is saved
// to the Bug console on the Admin tab, with the real message and stack trace.
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const [{ createServerClient, parseCookieHeader }, { SUPABASE_ANON_KEY, SUPABASE_URL }, { describeError, logError }] =
    await Promise.all([import("@supabase/ssr"), import("@/lib/supabase/config"), import("@/lib/errorLog")]);

  const header = (name: string) => {
    const value = request.headers[name];
    return Array.isArray(value) ? value.join("; ") : (value ?? "");
  };
  // Signed in as whoever hit the error, so the entry shows who it was.
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => parseCookieHeader(header("cookie")).map(({ name, value }) => ({ name, value: value ?? "" })),
      setAll: () => {},
    },
  });

  const { message, details, digest } = describeError(error);
  const what = { render: "Loading the page", route: "API request", action: "Saving a form", middleware: "Checking sign-in" }[
    context.routeType
  ];
  await logError(supabase, {
    source: "server",
    message,
    details: [`${what} (${request.method} ${context.routePath})`, details].filter(Boolean).join("\n"),
    page: request.path.split("?")[0],
    digest,
    userAgent: header("user-agent") || null,
  });
};
