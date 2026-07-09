const express = require("express");
const router = express.Router();

const {
  createUser,
  login,
  getProfile,
  authMiddleware,
  forgetPassword,
  getUserPermission,
  updateUserPermission,
  googleLogin,
  redirectToLinkedIn, // 👈 Naya extract kiya
  linkedinCallbackController,
  redirectToGitHub,
  githubCallbackController,
  sendOtp,
  verifyOtp, // 👈 Naya extract kiya
} = require("../controllers/UserController");

router.post("/register", createUser);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.get("/profile", authMiddleware, getProfile);
router.put("/forgetPassword", forgetPassword);

router.get("/permissions/:userId", authMiddleware, getUserPermission);
router.put("/permissions/:userId", authMiddleware, updateUserPermission);

// 🔥 LINKEDIN LOGIN WITHOUT PASSPORT MIDDLEWARES
// 1. Button click par direct link handle hoga
router.get("/login/linkedin", redirectToLinkedIn);

// 2. LinkedIn authorization code bhejega toh direct Controller handle karega
router.get("/auth/linkedin/callback", linkedinCallbackController);

router.get("/login/github", redirectToGitHub);

// 2. GitHub jab code bhejega toh controller processing karega
router.get("/auth/github/callback", githubCallbackController);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

module.exports = router;
