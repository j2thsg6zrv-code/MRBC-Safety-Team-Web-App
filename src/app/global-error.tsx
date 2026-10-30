"use client";

import { useEffect } from "react";
import { reportBrowserError } from "@/lib/errorLogBrowser";

// Only shown if the whole app fails to load, so it can't use the app's styles.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    void reportBrowserError(error, "The whole app crashed");
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 24, textAlign: "center" }}>
        <h1>Something went wrong</h1>
        <p>The details have been saved so an admin can fix it.</p>
        <button type="button" onClick={reset} style={{ padding: "8px 16px" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
