"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { reportBrowserError } from "@/lib/errorLogBrowser";

/**
 * Shown instead of a blank "Application error" screen when a page crashes.
 * Saves the error to the Bug console and shows its code and the reason.
 * Reloading fixes the common case of a page left open across an update.
 */
export function ErrorScreen({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [code, setCode] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    // A page left open across an update asks for code that no longer exists.
    // Reload once to get the new version instead of showing this screen.
    const stale =
      /ChunkLoadError|Loading (CSS )?chunk|dynamically imported module/i.test(error.message) ||
      /\/_next\/static\/chunks\/webpack-/.test(error.stack?.split("\n").slice(0, 2).join("\n") ?? "");
    try {
      const last = Number(sessionStorage.getItem("staleReload") || 0);
      if (stale && Date.now() - last > 30_000) {
        sessionStorage.setItem("staleReload", String(Date.now()));
        window.location.reload();
        return;
      }
    } catch {
      // No session storage: just show the screen.
    }
    let cancelled = false;
    reportBrowserError(error, "The page crashed and showed the error screen").then((c) => {
      if (!cancelled) setCode(c);
    });
    return () => {
      cancelled = true;
    };
  }, [error]);

  return (
    <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-2 text-xl font-semibold">Something went wrong</h1>
      <p className="mb-4 text-slate-700">
        Reload the page and try again. If it keeps happening, tell an admin the error code below. The details have
        been saved so it can be fixed.
      </p>
      <div className="mb-4 space-y-1 rounded-md bg-slate-100 p-3 text-sm">
        {code && (
          <p>
            Error code: <span className="font-mono font-semibold">{code}</span>
          </p>
        )}
        <p className="break-words font-mono text-xs text-slate-700">
          {error.message || "Unknown error"}
          {error.digest ? ` (${error.digest})` : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-onaccent hover:brightness-90"
        >
          Reload page
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-4 py-2 text-sm font-medium text-blue-700 underline"
        >
          Go to the dashboard
        </Link>
      </div>
    </div>
  );
}
