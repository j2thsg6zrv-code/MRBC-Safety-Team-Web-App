"use client";

import { useState } from "react";

const base = "rounded-md border px-3 py-2 text-sm font-medium";
const buttonClass = `${base} border-slate-300 bg-white text-slate-800 hover:bg-slate-50`;
const primaryClass = `${base} border-blue-700 bg-blue-700 text-onaccent hover:brightness-90`;

/** Ways to send a link: the phone's share sheet, copy, text, email, and the QR code as a picture. */
export function ShareLink({
  url,
  title,
  message,
  qrPng,
  qrFileName,
}: {
  url: string;
  title: string;
  message: string;
  qrPng: string;
  qrFileName: string;
}) {
  const [copied, setCopied] = useState(false);
  const body = `${message} ${url}`;

  async function share() {
    try {
      await navigator.share({ title, text: message, url });
    } catch {
      // Cancelled, or sharing isn't supported; the other buttons still work.
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={share} className={primaryClass}>
        Share…
      </button>
      <button type="button" onClick={copy} className={buttonClass}>
        {copied ? "Copied!" : "Copy link"}
      </button>
      <a href={`sms:?&body=${encodeURIComponent(body)}`} className={buttonClass}>Text</a>
      <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`} className={buttonClass}>
        Email
      </a>
      <a href={qrPng} download={qrFileName} className={buttonClass}>Download QR code</a>
    </div>
  );
}
