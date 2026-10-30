"use client";

import { useEffect } from "react";
import { reportBrowserError } from "@/lib/errorLogBrowser";

// Noise from browsers and extensions that isn't a problem with the app.
const IGNORE = [/ResizeObserver loop/, /^Script error\.?$/];

/** Saves any uncaught browser error to the Bug console on the Admin tab. */
export function ErrorReporter() {
  useEffect(() => {
    function onError(event: ErrorEvent) {
      const message = event.error?.message ?? event.message;
      if (IGNORE.some((re) => re.test(message ?? ""))) return;
      const where = event.filename ? `At ${event.filename}:${event.lineno}:${event.colno}` : undefined;
      void reportBrowserError(event.error ?? event.message, where);
    }
    function onRejection(event: PromiseRejectionEvent) {
      void reportBrowserError(event.reason, "Unhandled promise rejection");
    }
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
