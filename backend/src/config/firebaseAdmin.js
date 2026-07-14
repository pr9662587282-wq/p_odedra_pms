const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");

let messaging = null;

try {
  if (getApps().length === 0) {

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      // Render env vars sometimes escape newlines — fix them
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
        .replace(/\\n/g, "\n");   // unescape \\n → real newline

      let serviceAccount;
      try {
        serviceAccount = JSON.parse(raw);
      } catch (parseErr) {
        console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", parseErr.message);
        console.error("   First 100 chars:", raw.substring(0, 100));
        throw parseErr;
      }

      // Fix private key newlines if they got double-escaped
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
      }

      initializeApp({ credential: cert(serviceAccount) });
      console.log("✅ Firebase Admin initialized from env variable");
      console.log("   project_id:", serviceAccount.project_id);
      console.log("   private_key_id:", serviceAccount.private_key_id);

    } else {
      try {
        const serviceAccount = require("./firebase-service-account.json");
        initializeApp({ credential: cert(serviceAccount) });
        console.log("✅ Firebase Admin initialized from service account file");
      } catch (fileErr) {
        console.error("❌ No firebase credentials found — push notifications disabled");
      }
    }
  }

  messaging = getApps().length > 0 ? getMessaging() : null;

} catch (err) {
  console.error("❌ Firebase Admin init error:", err.message);
  messaging = null;
}

module.exports = { messaging };
