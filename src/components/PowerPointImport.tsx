"use client";

import { unstable_rethrow } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { readPptx, type DeckToSave, type SlidePicture } from "@/lib/pptx";
import { createClient } from "@/lib/supabase/client";
import { PICTURE_BUCKET } from "@/lib/training";

const MAX_WIDTH = 1600;

/** Big photos are shrunk to a sensible size for a slide so lessons load quickly. */
async function shrink(picture: SlidePicture): Promise<{ blob: Blob; ext: string }> {
  const original = new Blob([picture.data as BlobPart], { type: picture.type });
  if (picture.data.length < 500_000 || picture.ext === "gif") return { blob: original, ext: picture.ext };
  try {
    const bitmap = await createImageBitmap(original);
    const scale = Math.min(1, MAX_WIDTH / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, "image/jpeg", 0.85));
    return blob && blob.size < original.size ? { blob, ext: "jpg" } : { blob: original, ext: picture.ext };
  } catch {
    return { blob: original, ext: picture.ext };
  }
}

/**
 * Reads the PowerPoint in the browser, uploads each slide's picture straight
 * to storage, and sends only the text to the server, so decks full of
 * pictures aren't stopped by the upload size limit.
 */
export function PowerPointImport({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const submit = async (formData: FormData) => {
    setError(null);
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return setError("Choose a PowerPoint file first.");
    if (!/\.(pptx|ppsx)$/i.test(file.name)) {
      return setError(
        "Only .pptx and .ppsx files can be imported. In PowerPoint, use File → Save As → PowerPoint Presentation (.pptx).",
      );
    }
    try {
      setProgress("Reading the slides…");
      const deck = await readPptx(await file.arrayBuffer(), file.name);
      const supabase = createClient();
      const withPictures = deck.slides.filter((s) => s.picture).length;
      let uploaded = 0;
      const toSave: DeckToSave = { title: deck.title, summary: deck.summary, slides: [] };
      for (const slide of deck.slides) {
        let image_path: string | undefined;
        if (slide.picture) {
          setProgress(`Saving picture ${++uploaded} of ${withPictures}…`);
          const { blob, ext } = await shrink(slide.picture);
          const path = `slides/${crypto.randomUUID()}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from(PICTURE_BUCKET)
            .upload(path, blob, { contentType: blob.type });
          // A picture that won't save shouldn't stop the import; the slide just has no picture.
          if (!uploadError) image_path = path;
        }
        toSave.slides.push({ title: slide.title, body: slide.body, image_path });
      }
      setProgress("Saving the class…");
      const data = new FormData();
      data.set("deck", JSON.stringify(toSave));
      await action(data);
    } catch (e) {
      unstable_rethrow(e);
      setError(e instanceof Error && e.message ? e.message : "That file couldn't be imported.");
    } finally {
      setProgress(null);
    }
  };

  return (
    <form action={submit} className="flex flex-wrap items-end gap-3">
      <label className="block min-w-64 flex-1">
        <span className="mb-1 block text-sm font-medium text-slate-700">PowerPoint file (.pptx or .ppsx)</span>
        <input
          type="file"
          name="file"
          accept=".pptx,.ppsx,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.presentationml.slideshow"
          required
          className="block w-full text-sm"
          onChange={() => setError(null)}
        />
      </label>
      <Button type="submit" pendingLabel="Importing…">Import as draft</Button>
      {progress && <p className="w-full text-sm text-slate-600">{progress}</p>}
      {error && <p className="w-full text-sm text-red-700">{error}</p>}
    </form>
  );
}
