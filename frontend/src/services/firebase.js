import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCGloUIjSVvxLe-d-YRmgaN11qwO9HWAtw",
  authDomain: "push-2eaa7.firebaseapp.com",
  projectId: "push-2eaa7",
  storageBucket: "push-2eaa7.firebasestorage.app",
  messagingSenderId: "1062758461123",
  appId: "1:1062758461123:web:67e40cd1b87b21a16a7c76",
  measurementId: "G-TSGR0491E8",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const VAPID_KEY =
  "BNmdLFBK-t_AGofqTjE1Rf9HpZ7yVTqwCnuTo3yKBFVbteQ-2XJ4uGxhXh5QsQs3vxL9cPBOOqn2mq1o7EEd3s4";

export const requestFcmToken = async () => {
  try {
    console.log("🔔 Requesting FCM token...");
    const permission = await Notification.requestPermission();
    console.log("🔔 Notification permission:", permission);
    
    if (permission !== "granted") {
      console.log("❌ Notification permission not granted");
      return null;
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );
    console.log("🔔 Service Worker registered:", registration);
    
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    console.log("✅ Got FCM token:", token);
    return token;
  } catch (err) {
    console.error("❌ FCM token error:", err);
    return null;
  }
};

export const listenForegroundMessages = (callback) => {
  console.log("🔔 Setting up foreground message listener...");
  onMessage(messaging, (payload) => {
    console.log("📩 Received foreground message:", payload);
    callback(payload);
  });
};
