// Service worker: shows Team Chat push notifications and opens the chat when tapped.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "MRBC Safety Team";
  const url = data.url || "/chat";

  event.waitUntil(
    (async () => {
      // If the app is open and on screen, the in-app sound already covers it.
      // iPhones require every push to show a notification, so always show there.
      const ios = /iPhone|iPad|iPod/.test(self.navigator.userAgent);
      if (!ios) {
        const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        if (windows.some((w) => w.visibilityState === "visible" && w.focused)) return;
      }
      await self.registration.showNotification(title, {
        body: data.body || "New message",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: data.tag,
        renotify: true,
        data: { url },
      });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || "/chat", self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const w of windows) {
        if (new URL(w.url).origin === self.location.origin) {
          await w.focus();
          if ("navigate" in w) await w.navigate(url);
          return;
        }
      }
      await self.clients.openWindow(url);
    })(),
  );
});
