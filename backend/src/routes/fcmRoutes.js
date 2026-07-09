const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authMiddleware } = require("../controllers/UserController"); // apna exact file naam confirm karo

router.post("/fcm/save-token", authMiddleware, async (req, res) => {
  console.log("🔥 req.user:", req.user);
  console.log("🔥 req.body:", req.body);
  try {
    const userId = req.user?.id || req.user?._id || req.body.userId;
    const { token } = req.body;
    if (!userId || !token)
      return res.status(400).json({ message: "Missing data" });

    await User.findByIdAndUpdate(userId, { $addToSet: { fcmTokens: token } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
