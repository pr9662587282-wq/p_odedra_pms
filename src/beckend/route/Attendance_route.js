const express = require("express");
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
} = require("../controller/User_attendance");

// Import auth middleware from existing UserController
const { authMiddleware } = require("../controller/UserController");

router.post("/attendance/checkin", authMiddleware, checkIn);
router.post("/attendance/checkout", authMiddleware, checkOut);
router.post("/attendance/breakin", authMiddleware, breakIn);
router.post("/attendance/breakout", authMiddleware, breakOut);
router.get("/attendance/me", authMiddleware, getMyAttendance);
router.get("/attendance/today", authMiddleware, getTodayAttendance);
router.get("/UpcomingBday", UpcomingBday);
// admin are access attedance penal and change time .
router.get("/attendance/user/:userId", authMiddleware, getUserAttendance);
router.get(
  "/attendance/today/:userId",
  authMiddleware,
  getTodayAttendanceByUser,
);

module.exports = router;
