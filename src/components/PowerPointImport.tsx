"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { readPptx } from "@/lib/pptx";

/**
 * Reads the PowerPoint in the browser and sends only its text to the server,
 * so decks full of pictures aren't stopped by the upload size limit.
 */
export function PowerPointImport({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [error, setError] = useState<string | null>(null);

  const submit = async (formData: FormData) => {
    setError(null);
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return setError("Choose a PowerPoint file first.");
    if (!file.name.toLowerCase().endsWith(".pptx")) {
      return setError(
        "Only .pptx files can be imported. In PowerPoint, use File → Save As → PowerPoint Presentation (.pptx).",
      );
    }
    let deck;
    try {
      deck = await readPptx(await file.arrayBuffer());
    } catch (e) {
      return setError(e instanceof Error && e.message ? e.message : "That file couldn't be read as a PowerPoint.");
    }
    const data = new FormData();
    data.set("deck", JSON.stringify(deck));
    await action(data);
  };

  return (
    <form action={submit} className="flex flex-wrap items-end gap-3">
      <label className="block min-w-64 flex-1">
        <span className="mb-1 block text-sm font-medium text-slate-700">PowerPoint file (.pptx)</span>
        <input
          type="file"
          name="file"
          accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          required
          className="block w-full text-sm"
          onChange={() => setError(null)}
        />
      </label>
      <Button type="submit" pendingLabel="Importing…">Import as draft</Button>
      {error && <p className="w-full text-sm text-red-700">{error}</p>}
    </form>
  );
}
