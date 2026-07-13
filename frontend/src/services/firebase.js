import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCGloUIjSVvxLe-d-YRmgaN11qwO9HWAtw",
  authDomain: "push-2eaa7.firebaseapp.com",
  projectId: "push-2eaa7",
  storageBucket: "push-2eaa7.firebasestorage.app",
  messagingSenderId: "1062758461123",
  appId: "1:1062758461123:web:67e40cd1b87b21a16a7c76",
  measurementId: "G-TSGR0491E8",
};

const VAPID_KEY =
  "BNmdLFBK-t_AGofqTjE1Rf9HpZ7yVTqwCnuTo3yKBFVbteQ-2XJ4uGxhXh5QsQs3vxL9cPBOOqn2mq1o7EEd3s4";

const app = initializeApp(firebaseConfig);

// ─── Check if device is mobile ────────────────────────────────────────────────
export const isMobileDevice = () => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// ─── Lazy messaging instance ──────────────────────────────────────────────────
let messagingInstance = null;
const getMessagingInstance = async () => {
  if (messagingInstance) return messagingInstance;
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("⚠️ FCM not supported in this browser");
      return null;
    }
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch (err) {
    console.error("❌ getMessaging error:", err);
    return null;
  }
};

// ─── Request permission + get FCM token ──────────────────────────────────────
export const requestFcmToken = async () => {
  try {
    if (!("serviceWorker" in navigator)) {
      console.warn("⚠️ Service Workers not supported");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("❌ Notification permission denied");
      return null;
    }

    let registration;
    try {
      registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        { scope: "/" }
      );
      await navigator.serviceWorker.ready;
    } catch (swErr) {
      console.error("❌ SW registration failed:", swErr);
      return null;
    }

    const msg = await getMessagingInstance();
    if (!msg) return null;

    const token = await getToken(msg, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    console.log("✅ FCM Token:", token ? token.substring(0, 30) + "..." : "null");
    return token || null;
  } catch (err) {
    console.error("❌ requestFcmToken error:", err);
    return null;
  }
};

// ─── Foreground message listener ──────────────────────────────────────────────
// KEY LOGIC:
//   • Mobile  → show REAL OS notification via Service Worker (goes to notification bar)
//               callback is NOT called so app doesn't also show toast
//   • Desktop → call callback so ChatPage shows the in-app WhatsApp-style toast only
//               no OS notification on desktop (no need)
export const listenForegroundMessages = async (callback) => {
  const msg = await getMessagingInstance();
  if (!msg) return;

  onMessage(msg, async (payload) => {
    console.log("📩 Foreground FCM message:", payload);

    const mobile = isMobileDevice();

    if (mobile) {
      // ── MOBILE: show real OS notification bar notification ──────────────
      // Firebase suppresses it in foreground, so we manually trigger via SW
      if ("serviceWorker" in navigator && Notification.permission === "granted") {
        try {
          const registration = await navigator.serviceWorker.ready;

          const title = payload.notification?.title || "New Message";
          const body  = payload.notification?.body  || "You have a new message";
          const url   = payload.data?.url            || "/chat";

          // showNotification via SW → goes to real Android notification bar
          await registration.showNotification(title, {
            body,
            icon: "/icons/icon-192x192.png",
            badge: "/icons/badge-72x72.png",
            tag: url,           // collapses same-chat notifications
            renotify: true,     // vibrate again even if same tag
            silent: false,
            vibrate: [200, 100, 200],
            data: {
              url,
              senderId: payload.data?.senderId || "",
            },
            actions: [
              { action: "reply_open", title: "💬 Open Chat" },
              { action: "dismiss",    title: "✕ Dismiss"   },
            ],
          });

          console.log("✅ OS notification shown on mobile");
        } catch (err) {
          console.error("❌ SW showNotification failed:", err);
          // Fallback to in-app toast if SW fails
          callback(payload);
        }
      }
      // DO NOT call callback on mobile — OS bar notification is enough
      // (calling it would show both bar notification + toast = double notification)

    } else {
      // ── DESKTOP: show in-app toast only (no OS notification needed on PC) ─
      callback(payload);
    }
  });
};
