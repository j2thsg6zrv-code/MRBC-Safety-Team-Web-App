"use client";

import { useEffect, useRef, useState } from "react";

/** A phone number that, when tapped, offers Call or Text message. */
export function PhoneLink({ phone, className = "" }: { phone: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLSpanElement>(null);

  // Close the menu on a tap anywhere else, or on Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const number = phone.replace(/[^\d+]/g, "");
  const item = "block px-4 py-2 text-sm text-slate-800 hover:bg-slate-100";

  return (
    <span ref={box} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="text-blue-700 underline"
      >
        {phone}
      </button>
      {open && (
        <span
          role="menu"
          className="absolute left-0 top-full z-20 mt-1 block min-w-36 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg"
        >
          <a role="menuitem" href={`tel:${number}`} className={item} onClick={() => setOpen(false)}>
            Call
          </a>
          <a role="menuitem" href={`sms:${number}`} className={`${item} border-t border-slate-100`} onClick={() => setOpen(false)}>
            Text message
          </a>
        </span>
      )}
    </span>
  );
}
