"use client";

import { ErrorScreen } from "@/components/ErrorScreen";

export default function RootError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <ErrorScreen {...props} />
    </main>
  );
}
