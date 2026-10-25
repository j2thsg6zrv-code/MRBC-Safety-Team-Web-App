"use client";

import { useEffect, useState } from "react";

/**
 * Opens the phone's Messages app with a reminder to a time slot's greeters.
 * iPhones and Android phones spell a text to several people differently.
 */
export function GreeterReminder({ phones, message }: { phones: string[]; message: string }) {
  const [ios, setIos] = useState(false);
  useEffect(() => {
    setIos(/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent));
  }, []);

  const numbers = phones.map((p) => p.replace(/[^\d+]/g, ""));
  const body = encodeURIComponent(message);
  const href = ios
    ? `sms:/open?addresses=${numbers.join(",")}&body=${body}`
    : `sms:${numbers.join(",")}?body=${body}`;

  return (
    <a
      href={href}
      className="mt-2 inline-block rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
    >
      Send reminder{phones.length > 1 ? ` (${phones.length})` : ""}
    </a>
  );
}
