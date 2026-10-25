"use client";

import { useEffect, useRef, useState } from "react";

const TRIGGER = 70; // how far (in pixels) to pull before letting go reloads
const MAX = 110;

// Browsers already have their own pull-to-refresh, so this only runs when the
// app has been added to a home screen or desktop, where there isn't one.
function isInstalledApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// Don't start a pull from inside something that scrolls on its own and isn't at
// its top, or while typing.
function blocksPull(target: EventTarget | null) {
  for (let el = target as HTMLElement | null; el && el !== document.body; el = el.parentElement) {
    if (el.matches("input, textarea, select, [contenteditable]")) return true;
    if (el.scrollTop > 0 && el.scrollHeight > el.clientHeight) return true;
  }
  return false;
}

/** Swipe down from the top of the page to reload it, with the shield spinning while it does. */
export function PullToRefresh() {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const start = useRef<number | null>(null);
  const distance = useRef(0);

  useEffect(() => {
    if (!isInstalledApp()) return;
    document.documentElement.style.overscrollBehaviorY = "contain";

    function onStart(e: TouchEvent) {
      start.current = window.scrollY <= 0 && e.touches.length === 1 && !blocksPull(e.target) ? e.touches[0].clientY : null;
    }
    function onMove(e: TouchEvent) {
      if (start.current === null) return;
      const dy = e.touches[0].clientY - start.current;
      if (dy <= 0 || window.scrollY > 0) {
        distance.current = 0;
        setPull(0);
        return;
      }
      e.preventDefault();
      distance.current = Math.min(MAX, dy * 0.5);
      setPull(distance.current);
    }
    function onEnd() {
      if (start.current === null) return;
      start.current = null;
      if (distance.current >= TRIGGER) {
        setRefreshing(true);
        setPull(TRIGGER);
        window.location.reload();
      } else {
        setPull(0);
      }
      distance.current = 0;
    }

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  if (pull === 0 && !refreshing) return null;
  const ready = pull >= TRIGGER;
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center"
      style={{ transform: `translateY(${pull - 44}px)`, transition: start.current === null ? "transform 0.2s" : "none" }}
    >
      <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/icon-192.png"
          alt=""
          width={24}
          height={24}
          className={`rounded-md ${refreshing ? "animate-spin" : ""}`}
          style={refreshing ? undefined : { transform: `rotate(${(pull / TRIGGER) * 360}deg)` }}
        />
        {refreshing ? "Refreshing…" : ready ? "Let go to refresh" : "Pull to refresh"}
      </div>
    </div>
  );
}
