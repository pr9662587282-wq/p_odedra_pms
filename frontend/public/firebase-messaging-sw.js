importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js",
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

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  const url = payload.data?.url || "/chat";

  self.registration.showNotification(title, {
    body,
    icon: "/logo192.png",
    data: { url },
  });
});

// This is the part that opens the specific chat on click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/chat";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(targetUrl);
      }),
  );
});
