"use client";

import { useEffect, useState } from "react";

/** A photo that opens full screen when tapped. Tap anywhere, press Esc, or use × to close. */
export function PhotoViewer({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 cursor-zoom-in rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label={`Show a larger photo of ${alt}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={`block ${className ?? ""}`} />
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo of ${alt}`}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out flex-col items-center justify-center bg-black/90 p-4"
        >
          <button
            type="button"
            autoFocus
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-3xl leading-none text-white hover:bg-white/25"
            aria-label="Close photo"
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="max-h-[85vh] max-w-full rounded object-contain shadow-2xl" />
          <p className="mt-3 text-center text-sm text-white">{alt}</p>
        </div>
      )}
    </>
  );
}
