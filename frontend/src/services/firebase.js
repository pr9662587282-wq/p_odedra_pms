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

// ─── Lazy messaging instance (FCM not supported on all browsers/iOS) ──────────
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

// ─── Request notification permission + get FCM token ─────────────────────────
// Works on both desktop Chrome and Android Chrome (mobile Safari not supported by FCM)
export const requestFcmToken = async () => {
  try {
    // 1. Check if Service Workers are supported (required for FCM)
    if (!("serviceWorker" in navigator)) {
      console.warn("⚠️ Service Workers not supported");
      return null;
    }

    // 2. Ask permission — shows native browser prompt on mobile
    const permission = await Notification.requestPermission();
    console.log("🔔 Notification permission:", permission);

    if (permission !== "granted") {
      console.warn("❌ Notification permission denied by user");
      return null;
    }

    // 3. Register the service worker explicitly so FCM can use it
    let registration;
    try {
      registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        { scope: "/" }
      );
      // Wait until the SW is fully active (important on mobile)
      await navigator.serviceWorker.ready;
      console.log("✅ Service Worker active:", registration.scope);
    } catch (swErr) {
      console.error("❌ Service Worker registration failed:", swErr);
      return null;
    }

    // 4. Get FCM messaging instance
    const msg = await getMessagingInstance();
    if (!msg) return null;

    // 5. Get the FCM token
    const token = await getToken(msg, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("✅ FCM Token obtained:", token.substring(0, 30) + "...");
    } else {
      console.warn("⚠️ No FCM token received (check VAPID key & Firebase config)");
    }

    return token || null;
  } catch (err) {
    console.error("❌ requestFcmToken error:", err);
    return null;
  }
};

// ─── Listen for foreground messages (app is open & in focus) ─────────────────
// On mobile: shows toast inside app (service worker handles background)
export const listenForegroundMessages = async (callback) => {
  const msg = await getMessagingInstance();
  if (!msg) return;

  onMessage(msg, (payload) => {
    console.log("📩 Foreground message:", payload);
    callback(payload);
  });
};
