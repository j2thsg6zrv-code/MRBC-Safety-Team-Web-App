"use client";

import { useRef } from "react";
import { Button } from "@/components/Button";

/**
 * A Delete link that opens a box asking for the class delete password. The
 * password is checked on the server; nothing about it lives in the browser.
 */
export function DeleteClassButton({
  classId,
  title,
  action,
}: {
  classId: string;
  title: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} className="text-sm text-red-700 underline">
        Delete
      </button>
      <dialog
        ref={dialog}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-slate-200 bg-white p-0 text-slate-900 shadow-lg backdrop:bg-black/40"
      >
        <form action={action} className="space-y-3 p-4">
          <input type="hidden" name="id" value={classId} />
          <h2 className="font-semibold">Delete &ldquo;{title}&rdquo;?</h2>
          <p className="text-sm text-slate-700">
            This removes the class, its slides and quiz, and everyone&apos;s progress and pass history for it. It
            can&apos;t be undone. Certifications people already earned stay on their records.
          </p>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Delete password</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="off"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => dialog.current?.close()}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" pendingLabel="Deleting…">
              Delete class
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
