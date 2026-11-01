"use client";

import { useEffect, useState } from "react";
import { pushPublicKey, removePushSubscription, savePushSubscription } from "@/app/(app)/push-actions";

type State = "loading" | "unsupported" | "ios-home-screen" | "blocked" | "off" | "on" | "working";

function keyBytes(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

function deviceName() {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android";
  if (/Mac/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows";
  return "Browser";
}

/** Turns phone/computer notifications for Team Chat on or off for this device. */
export function PushSetting() {
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true;
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setState(ios && !standalone ? "ios-home-screen" : "unsupported");
        return;
      }
      if (Notification.permission === "denied") return setState("blocked");
      const reg = await navigator.serviceWorker.getRegistration("/");
      const sub = await reg?.pushManager.getSubscription();
      setState(sub && Notification.permission === "granted" ? "on" : "off");
    })().catch(() => setState("unsupported"));
  }, []);

  async function turnOn() {
    setState("working");
    setMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "blocked" : "off");
        return;
      }
      const key = await pushPublicKey();
      if (!key) throw new Error("Notifications aren't set up yet. An admin needs to turn them on once on My Profile first.");
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(key) }));
      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      const result = await savePushSubscription(json, deviceName());
      if (result.error) throw new Error(result.error);
      setState("on");
      setMessage("Notifications are on for this device.");
    } catch (e) {
      setState("off");
      setMessage(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }

  async function turnOff() {
    setState("working");
    setMessage(null);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setState("off");
      setMessage("Notifications are off for this device.");
    } catch {
      setState("on");
      setMessage("Couldn't turn them off. Please try again.");
    }
  }

  const button = "rounded-md px-3 py-1.5 text-sm font-medium";
  return (
    <div className="space-y-2 text-sm">
      {state === "loading" && <p className="text-slate-500">Checking this device…</p>}
      {state === "ios-home-screen" && (
        <p>
          On iPhone and iPad, notifications only work from the Home Screen app. In Safari, tap the{" "}
          <strong>Share</strong> button, then <strong>Add to Home Screen</strong>. Open MRBC Safety from your Home Screen,
          sign in, and come back to My Profile to turn them on.
        </p>
      )}
      {state === "unsupported" && <p>This browser can&apos;t show notifications. Try Chrome, Edge, Firefox, or Safari.</p>}
      {state === "blocked" && (
        <p>
          Notifications are blocked for this site. Allow them in your browser or phone settings (Settings &gt;
          Notifications), then reload this page.
        </p>
      )}
      {(state === "off" || state === "on" || state === "working") && (
        <>
          <p>
            {state === "on"
              ? "On for this device. You'll get a notification for new Team Chat messages, even when the app is closed."
              : "Get a notification on this phone or computer when someone messages you, even when the app is closed."}
          </p>
          {state === "on" ? (
            <button type="button" onClick={turnOff} className={`${button} border border-slate-300`}>
              Turn off on this device
            </button>
          ) : (
            <button
              type="button"
              onClick={turnOn}
              disabled={state === "working"}
              className={`${button} bg-blue-700 text-white disabled:opacity-60`}
            >
              {state === "working" ? "Turning on…" : "Turn on notifications"}
            </button>
          )}
        </>
      )}
      {message && <p className="text-slate-600">{message}</p>}
      <p className="text-xs text-slate-500">Set this up on each phone or computer you use.</p>
    </div>
  );
}
