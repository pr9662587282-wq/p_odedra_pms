importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCGloUIjSVvxLe-d-YRmgaN11qwO9HWAtw",
  authDomain: "push-2eaa7.firebaseapp.com",
  projectId: "push-2eaa7",
  storageBucket: "push-2eaa7.firebasestorage.app",
  messagingSenderId: "1062758461123",
  appId: "1:1062758461123:web:67e40cd1b87b21a16a7c76",
  measurementId: "G-TSGR0491E8",
});

const messaging = firebase.messaging();

// ─── Background Message Handler ───────────────────────────────────────────────
// This fires when app is in background / phone screen locked / different app open
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message received:", payload);

  const title = payload.notification?.title || "New Message";
  const body  = payload.notification?.body  || "You have a new message";
  const senderUrl = payload.data?.url || "/chat";
  const senderName = payload.data?.senderName || "Team Member";
  const messageText = payload.data?.messageText || body;

  // WhatsApp-style notification options
  const options = {
    body: messageText,
    icon: "/icons/icon-192x192.png",    // app icon
    badge: "/icons/badge-72x72.png",    // small mono icon in status bar (Android)
    image: payload.data?.imageUrl || undefined, // inline image if photo sent
    tag: senderUrl,                     // collapse duplicate notifications from same chat
    renotify: true,                     // vibrate again even if tag matches
    requireInteraction: false,          // don't keep it open forever on desktop
    silent: false,
    vibrate: [200, 100, 200],           // WhatsApp-style double vibration pattern
    timestamp: Date.now(),
    data: {
      url: senderUrl,
      senderId: payload.data?.senderId || "",
    },
    // Action buttons below the notification body
    actions: [
      {
        action: "reply_open",
        title: "💬 Open Chat",
        icon: "/icons/chat-icon.png",
      },
      {
        action: "dismiss",
        title: "✕ Dismiss",
        icon: "/icons/close-icon.png",
      },
    ],
  };

  self.registration.showNotification(title, options);
});

// ─── Notification Click Handler ───────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const action    = event.action;
  const targetUrl = event.notification.data?.url || "/chat";

  // If user clicked "Dismiss" action button — just close
  if (action === "dismiss") return;

  // For both direct click and "Open Chat" button → navigate to chat
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // ── Case 1: App tab is already open ──────────────────────────────────
        for (const client of clientList) {
          if (
            client.url.includes(self.location.origin) &&
            "focus" in client
          ) {
            // Navigate existing tab directly to the chat URL
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // ── Case 2: No tab open → open a new one ────────────────────────────
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// ─── Push event fallback (for browsers that need manual show) ─────────────────
self.addEventListener("push", (event) => {
  // Firebase SDK handles this above, but some Android browsers bypass it.
  // Only fire if Firebase didn't already handle it (check if data exists).
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  // If Firebase handled it (has notification key), skip manual show
  if (payload.notification) return;

  const title = payload.data?.title || "New Message";
  const body  = payload.data?.body  || "";
  const url   = payload.data?.url   || "/chat";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      tag: url,
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url },
      actions: [
        { action: "reply_open", title: "💬 Open Chat" },
        { action: "dismiss",    title: "✕ Dismiss" },
      ],
    })
  );
});
