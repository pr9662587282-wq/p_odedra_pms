const router = require("express").Router();
const { authMiddleware } = require("../controller/UserController");
const {
  applyLeave,
  getHistory,
  getBalance,
  getAllLeaves,
  updateStatus,
} = require("../controller/leaveController");

// --- User Routes ---
router.post("/apply", authMiddleware, applyLeave);
router.get("/history", authMiddleware, getHistory);
router.get("/balance", authMiddleware, getBalance);

// --- Admin-only Routes ---
// This is the line that adds the getAllLeaves functionality to the path '/all'
// Inside your route file (leave.js)
// Change this line:
router.get("/admin/all", authMiddleware, getAllLeaves);
router.patch("/admin/:id/status", authMiddleware, updateStatus);

module.exports = router;
