"use client";

/**
 * Shown instead of a blank "Application error" screen when a page crashes,
 * with the reason, so it can be reported. Reloading fixes the common case of
 * a page left open across an update.
 */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg space-y-3 py-12 text-center">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="text-sm text-slate-600">
        Reload the page and try again. If it keeps happening, send a screenshot of this message.
      </p>
      <p className="rounded-md bg-slate-100 p-3 text-left font-mono text-xs break-words text-slate-700">
        {error.message || "Unknown error"}
        {error.digest ? ` (${error.digest})` : ""}
      </p>
      <div className="flex justify-center gap-2">
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
      </div>
    </div>
  );
}
