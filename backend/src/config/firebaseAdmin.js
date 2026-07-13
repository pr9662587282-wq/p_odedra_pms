const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");

let messaging;

try {
  // ── Only initialize once (avoid duplicate app error on hot-reload) ────────
  if (getApps().length === 0) {

    // ── Priority 1: Environment variable (Render / production) ───────────────
    // Set FIREBASE_SERVICE_ACCOUNT_JSON in Render dashboard as a single-line JSON string
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      initializeApp({ credential: cert(serviceAccount) });
      console.log("✅ Firebase Admin initialized from env variable");

    // ── Priority 2: Local JSON file (development) ─────────────────────────────
    } else {
      try {
        const serviceAccount = require("./firebase-service-account.json");
        initializeApp({ credential: cert(serviceAccount) });
        console.log("✅ Firebase Admin initialized from service account file");
      } catch (fileErr) {
        console.error("❌ firebase-service-account.json not found AND FIREBASE_SERVICE_ACCOUNT_JSON env not set");
        console.error("   Push notifications will NOT work until one of these is configured");
        // Don't crash the server — just messaging will be null
      }
    }
  }

  messaging = getApps().length > 0 ? getMessaging() : null;

} catch (err) {
  console.error("❌ Firebase Admin init error:", err.message);
  messaging = null;
}

// Safe wrapper — returns null if FCM not initialized
const safeMessaging = messaging;

module.exports = { messaging: safeMessaging };
