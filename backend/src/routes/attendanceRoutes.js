const express = require('express');
const router = express.Router();

// Import controller functions
const {
  checkIn,
  checkOut,
  breakIn,
  breakOut,
  getMyAttendance,
  getTodayAttendance,
  UpcomingBday,
  getUserAttendance,
  getTodayAttendanceByUser,
  getAttendanceHistory,
  updateAttendance, // ← ADD
  deleteAttendance, // ← ADD
  getMonthlyAttendanceRate,
} = require('../controllers/attendanceController');

// Import auth middleware from existing UserController
const { authMiddleware } = require('../controllers/userController');
router.get('/history/:userId', authMiddleware, getAttendanceHistory);
router.post('/attendance/checkin', authMiddleware, checkIn);
router.post('/attendance/checkout', authMiddleware, checkOut);
router.post('/attendance/breakin', authMiddleware, breakIn);
router.post('/attendance/breakout', authMiddleware, breakOut);
router.get('/attendance/me', authMiddleware, getMyAttendance);
router.get('/attendance/today', authMiddleware, getTodayAttendance);
router.get('/UpcomingBday', UpcomingBday);
// admin are access attedance penal and change time .
router.get('/attendance/user/:userId', authMiddleware, getUserAttendance);
router.get('/attendance/today/:userId', authMiddleware, getTodayAttendanceByUser);
router.put('/history/:id', authMiddleware, updateAttendance);
router.delete('/history/:id', authMiddleware, deleteAttendance);
router.get('/attendance/monthly-rate', authMiddleware, getMonthlyAttendanceRate);

module.exports = router;
