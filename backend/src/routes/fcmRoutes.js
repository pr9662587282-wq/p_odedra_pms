const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../controllers/userController');
const { messaging } = require('../config/firebaseAdmin');

// ── Save FCM token ────────────────────────────────────────────────────────────
router.post('/fcm/save-token', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.body.userId;
    const { token } = req.body;

    console.log('📲 [FCM] save-token called | userId:', userId, '| token:', token?.substring(0, 30));

    if (!userId || !token) {
      return res.status(400).json({ message: 'Missing userId or token' });
    }

    await User.findByIdAndUpdate(userId, { $addToSet: { fcmTokens: token } });

    // Confirm what is now stored
    const updated = await User.findById(userId).select('fcmTokens email');
    console.log('✅ [FCM] Tokens in DB for', updated?.email, ':', updated?.fcmTokens?.length);

    res.json({ success: true, tokenCount: updated?.fcmTokens?.length });
  } catch (err) {
    console.error('❌ [FCM] save-token error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── Debug: check saved tokens for logged-in user ─────────────────────────────
router.get('/fcm/debug-tokens', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId).select('email fcmTokens');
    res.json({
      email: user?.email,
      tokenCount: user?.fcmTokens?.length || 0,
      tokens: user?.fcmTokens || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Debug: manually send a test FCM push to logged-in user ───────────────────
router.post('/fcm/test-push', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId).select('email fcmTokens');

    console.log('🧪 [FCM] test-push for:', user?.email, '| tokens:', user?.fcmTokens?.length);

    if (!user?.fcmTokens?.length) {
      return res.status(400).json({
        message: 'No FCM tokens saved for this user. Open the app on mobile first.',
        email: user?.email,
      });
    }

    const payload = {
      notification: {
        title: '🧪 Test Notification',
        body: 'Push notification is working!',
      },
      data: {
        url: '/chat',
        senderId: userId.toString(),
      },
      tokens: user.fcmTokens,
      android: {
        priority: 'high',
        notification: { channelId: 'chat_messages', priority: 'max' },
      },
      webpush: {
        headers: { Urgency: 'high' },
        fcmOptions: { link: '/chat' },
      },
    };

    const response = await messaging.sendEachForMulticast(payload);

    console.log('🧪 [FCM] test-push response:', JSON.stringify(response));

    // Clean invalid tokens
    const invalidTokens = [];
    response.responses.forEach((r, idx) => {
      if (!r.success) {
        console.error('❌ Token failed:', user.fcmTokens[idx], '| error:', r.error?.message);
        invalidTokens.push(user.fcmTokens[idx]);
      }
    });
    if (invalidTokens.length) {
      await User.findByIdAndUpdate(userId, { $pull: { fcmTokens: { $in: invalidTokens } } });
    }

    res.json({
      success: response.successCount > 0,
      successCount: response.successCount,
      failureCount: response.failureCount,
      details: response.responses.map((r, i) => ({
        token: user.fcmTokens[i]?.substring(0, 20) + '...',
        success: r.success,
        error: r.error?.message || null,
      })),
    });
  } catch (err) {
    console.error('❌ [FCM] test-push error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
