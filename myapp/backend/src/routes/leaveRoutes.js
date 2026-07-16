const router = require('express').Router();
const { authMiddleware } = require('../controllers/userController');
const {
  applyLeave,
  getHistory,
  getBalance,
  getAllLeaves,
  updateStatus,
  updateLeaveDates,
} = require('../controllers/leaveController');

// --- User Routes ---
router.post('/apply', authMiddleware, applyLeave);
router.get('/history', authMiddleware, getHistory);
router.get('/balance', authMiddleware, getBalance);

// --- Admin-only Routes ---
// This is the line that adds the getAllLeaves functionality to the path '/all'
// Inside your route file (leave.js)
// Change this line:
router.get('/admin/all', authMiddleware, getAllLeaves);
router.patch('/admin/:id/status', authMiddleware, updateStatus);
router.patch('/admin/:id/dates', authMiddleware, updateLeaveDates);

module.exports = router;
