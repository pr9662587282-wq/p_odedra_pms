const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

let messaging = null;

try {
  if (getApps().length === 0) {

    let serviceAccount = null;

    // ── Option 1: Individual env vars (most reliable on Render) ──────────────
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID || 'push-2eaa7',
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
        // Render stores \n as literal \\n — replace back to real newlines
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID || '',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
      };
      console.log('✅ Firebase: using individual env vars');

    // ── Option 2: Full JSON env var ───────────────────────────────────────────
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      serviceAccount = JSON.parse(raw);
      // Fix private key newlines
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      console.log('✅ Firebase: using JSON env var, key_id:', serviceAccount.private_key_id);

    // ── Option 3: Local file (development) ────────────────────────────────────
    } else {
      try {
        serviceAccount = require('./firebase-service-account.json');
        console.log('✅ Firebase: using local service account file');
      } catch (_) {
        console.error('❌ No Firebase credentials found');
      }
    }

    if (serviceAccount) {
      initializeApp({ credential: cert(serviceAccount) });
      console.log('✅ Firebase Admin initialized | project:', serviceAccount.project_id);
    }
  }

  messaging = getApps().length > 0 ? getMessaging() : null;

} catch (err) {
  console.error('❌ Firebase Admin init error:', err.message);
  messaging = null;
}

module.exports = { messaging };
