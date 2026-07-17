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

// ─── Helper: Build rich WhatsApp-style notification options (regular msg) ────
function buildNotifOptions(payload) {
  const body = payload.notification?.body || payload.data?.messageText || 'New message';
  const senderUrl = payload.data?.url || '/chat';
  const senderId = payload.data?.senderId || '';

  return {
    body,
    icon: '/icons/notif-icon.png',
    badge: '/icons/badge-mono.png',
    tag: `chat-${senderId}`,
    renotify: true,
    silent: false,
    requireInteraction: false,
    vibrate: [300, 100, 300],
    timestamp: Date.now(),
    data: {
      url: senderUrl,
      senderId: senderId,
    },
    actions: [
      { action: 'open', title: '💬 Reply' },
      { action: 'dismiss', title: '✕' },
    ],
  };
}

// ─── Helper: call-specific notification (Accept/Decline, no auto-dismiss) ────
function buildCallNotifOptions(payload) {
  const fromName = payload.data?.fromName || 'Someone';
  const fromId = payload.data?.fromUserId || '';

  return {
    body: 'Incoming video call — tap to answer',
    icon: '/icons/notif-icon.png',
    badge: '/icons/badge-mono.png',
    tag: `call-${fromId}`,
    renotify: true,
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 300],
    timestamp: Date.now(),
    data: {
      type: 'incoming_call',
      url: payload.data?.url || '/chat',
      fromUserId: fromId,
      fromName: fromName,
    },
    actions: [
      { action: 'accept', title: '✅ Accept' },
      { action: 'decline', title: '❌ Decline' },
    ],
  };
}

// ─── SINGLE background message handler (handles both calls and regular msgs) ─
messaging.onBackgroundMessage((payload) => {
  if (payload.data?.type === 'incoming_call') {
    const fromName = payload.data?.fromName || 'Someone';
    self.registration.showNotification(
      `📞 Incoming call — ${fromName}`,
      buildCallNotifOptions(payload)
    );
    return;
  }

  const title = payload.notification?.title || payload.data?.senderName || 'New Message';
  self.registration.showNotification(title, buildNotifOptions(payload));
});

// ─── SINGLE notificationclick handler (handles both calls and regular msgs) ──
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};

  // ── Call notification: Accept / Decline / plain tap ──
  if (data.type === 'incoming_call') {
    const action = event.action; // 'accept' | 'decline' | '' (body tap = treat as accept)
    const resolvedAction = action || 'accept';
    const baseUrl = data.url || '/chat';
    const separator = baseUrl.includes('?') ? '&' : '?';
    const targetUrl = `${baseUrl}${separator}callAction=${resolvedAction}`;

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Tab already open — tell it what happened directly, no reload/navigate
            client.postMessage({
              type: 'CALL_NOTIFICATION_CLICK',
              action: resolvedAction,
              fromUserId: data.fromUserId,
            });
            return client.focus();
          }
        }
        // No tab open — open a fresh one with callAction in the URL
        if (clients.openWindow) return clients.openWindow(targetUrl);
      })
    );
    return;
  }

  // ── Regular message notification click ──
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

// ─── SINGLE raw push fallback (some Android browsers bypass Firebase SDK) ────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  // Firebase SDK already handled it via onBackgroundMessage — skip to avoid duplicates
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
