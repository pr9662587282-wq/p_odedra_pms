importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCGloUIjSVvxLe-d-YRmgaN11qwO9HWAtw',
  authDomain: 'push-2eaa7.firebaseapp.com',
  projectId: 'push-2eaa7',
  storageBucket: 'push-2eaa7.firebasestorage.app',
  messagingSenderId: '1062758461123',
  appId: '1:1062758461123:web:67e40cd1b87b21a16a7c76',
  measurementId: 'G-TSGR0491E8',
});

const messaging = firebase.messaging();

// ─── Helper: Build rich WhatsApp-style notification options ──────────────────
function buildNotifOptions(payload) {
  const body = payload.notification?.body || payload.data?.messageText || 'New message';
  const senderUrl = payload.data?.url || '/chat';
  const senderName = payload.data?.senderName || '';
  const senderId = payload.data?.senderId || '';

  return {
    // ── Content ──────────────────────────────────────────────────────────────
    body,

    // ── Icons ─────────────────────────────────────────────────────────────────
    // icon  = large icon shown next to notification body (use your app logo)
    // badge = tiny mono icon in Android status bar (like WhatsApp's green icon)
    icon: '/icons/notif-icon.png', // 512x512 colored app icon
    badge: '/icons/badge-mono.png', // 96x96 monochrome white icon

    // ── Behavior ──────────────────────────────────────────────────────────────
    tag: `chat-${senderId}`, // collapses multiple msgs from same person
    renotify: true, // vibrate again even with same tag
    silent: false,
    requireInteraction: false, // auto-dismiss after a few seconds

    // ── Android vibration (WhatsApp pattern) ──────────────────────────────────
    vibrate: [300, 100, 300],

    // ── Timestamp (shows "just now" / "2 min ago") ────────────────────────────
    timestamp: Date.now(),

    // ── Data passed to notificationclick ──────────────────────────────────────
    data: {
      url: senderUrl,
      senderId: senderId,
    },

    // ── Action buttons ────────────────────────────────────────────────────────
    actions: [
      { action: 'open', title: '💬 Reply' },
      { action: 'dismiss', title: '✕' },
    ],
  };
}

// ─── Background / app-closed message handler ─────────────────────────────────
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.senderName || 'New Message';
  self.registration.showNotification(title, buildNotifOptions(payload));
});

// vedio call fun.....................................................................................

// ─── Helper: call-specific notification (Accept/Decline, no auto-dismiss) ───
function buildCallNotifOptions(payload) {
  const fromName = payload.data?.fromName || 'Someone';
  const fromId = payload.data?.fromUserId || '';

  return {
    body: 'Incoming video call — tap to answer',
    icon: '/icons/notif-icon.png',
    badge: '/icons/badge-mono.png',
    tag: `call-${fromId}`, // replaces any older call notif from same person
    renotify: true,
    requireInteraction: true, // stays on screen until user acts
    vibrate: [300, 100, 300, 100, 300],
    timestamp: Date.now(),
    data: {
      type: 'incoming_call',
      url: payload.data?.url || '/chat',
      fromUserId: fromId,
    },
    actions: [
      { action: 'accept', title: '✅ Accept' },
      { action: 'decline', title: '❌ Decline' },
    ],
  };
}

// ─── Background / app-closed message handler ─────────────────────────────────
messaging.onBackgroundMessage((payload) => {
  if (payload.data?.type === 'incoming_call') {
    const fromName = payload.data?.fromName || 'Someone';
    self.registration.showNotification(
      `📞 Incoming call — ${fromName}`,
      buildCallNotifOptions(payload)
    );
    return;
  }

  // your existing message/reaction handling stays exactly the same
  const title = payload.notification?.title || payload.data?.senderName || 'New Message';
  self.registration.showNotification(title, buildNotifOptions(payload));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};

  // ── Call notification: Accept / Decline / plain tap ──
  if (data.type === 'incoming_call') {
    const action = event.action; // 'accept' | 'decline' | '' (body tap)
    const targetUrl = `${data.url || '/chat'}&callAction=${action || 'open'}`;

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Tab already open — tell it what happened, don't reload
            client.postMessage({
              type: 'CALL_NOTIFICATION_CLICK',
              action,
              fromUserId: data.fromUserId,
            });
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(targetUrl);
      })
    );
    return;
  }

  // ── existing message-click handling — unchanged ──
  if (event.action === 'dismiss') return;
  const targetUrl = data.url || '/chat';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }
  if (payload.notification) return;

  if (payload.data?.type === 'incoming_call') {
    const fromName = payload.data?.fromName || 'Someone';
    event.waitUntil(
      self.registration.showNotification(
        `📞 Incoming call — ${fromName}`,
        buildCallNotifOptions(payload)
      )
    );
    return;
  }

  const title = payload.data?.senderName || payload.data?.title || 'New Message';
  event.waitUntil(self.registration.showNotification(title, buildNotifOptions(payload)));
});

//.....................................................................................................

// ─── Notification click handler ──────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/chat';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app already open — navigate existing tab to chat
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open new tab directly to chat
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// ─── Raw push fallback (some Android browsers bypass Firebase SDK) ────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  // Firebase SDK already handled it via onBackgroundMessage — skip
  if (payload.notification) return;

  const title = payload.data?.senderName || payload.data?.title || 'New Message';
  event.waitUntil(self.registration.showNotification(title, buildNotifOptions(payload)));
});
