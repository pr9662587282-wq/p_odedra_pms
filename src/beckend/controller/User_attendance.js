const Attendance = require("../models/Attendance");
const UserFrom = require("../models/User_fromdata");

// Today's date string "2026-05-19"
function todayDate() {
  return new Date().toISOString().split("T")[0];
}

// ── CHECK IN — only once per day ──
exports.checkIn = async (req, res) => {
  try {
    const existing = await Attendance.findOne({
      userId: req.user.id,
      date: todayDate(),
    });

    if (existing) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const data = await Attendance.create({
      userId: req.user.id,
      date: todayDate(),
      checkIn: new Date(),
      breaks: [], // empty breaks array
    });

    res.json({ message: "Checked In", data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── CHECK OUT — only once per day ──
exports.checkOut = async (req, res) => {
  try {
    const record = await Attendance.findOne({
      userId: req.user.id,
      date: todayDate(),
    });

    if (!record)
      return res.status(400).json({ message: "Please check in first" });
    if (record.checkOut)
      return res.status(400).json({ message: "Already checked out today" });

    record.checkOut = new Date();
    await record.save();

    res.json({ message: "Checked Out", data: record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── BREAK IN — multiple times allowed ──
// Adds a new break entry with breakIn time
exports.breakIn = async (req, res) => {
  try {
    const record = await Attendance.findOne({
      userId: req.user.id,
      date: todayDate(),
    });

    if (!record)
      return res.status(400).json({ message: "Please check in first" });

    // Check if there is already an open break (breakIn without breakOut)
    const openBreak = record.breaks.find((b) => b.breakIn && !b.breakOut);
    if (openBreak)
      return res
        .status(400)
        .json({ message: "Already on break, do Break Out first" });

    // Push a new break with only breakIn set
    record.breaks.push({ breakIn: new Date() });
    await record.save();

    res.json({ message: "Break Started", data: record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── BREAK OUT — closes the current open break ──
exports.breakOut = async (req, res) => {
  try {
    const record = await Attendance.findOne({
      userId: req.user.id,
      date: todayDate(),
    });

    if (!record)
      return res.status(400).json({ message: "Please check in first" });

    // Find the open break (breakIn set, breakOut not set)
    const openBreak = record.breaks.find((b) => b.breakIn && !b.breakOut);
    if (!openBreak)
      return res.status(400).json({ message: "No open break found" });

    // Set breakOut on the open break
    openBreak.breakOut = new Date();
    await record.save();

    res.json({ message: "Break Ended", data: record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET ALL MY ATTENDANCE ──
exports.getMyAttendance = async (req, res) => {
  try {
    const data = await Attendance.find({ userId: req.user.id }).sort({
      date: -1,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET TODAY'S ATTENDANCE ──
exports.getTodayAttendance = async (req, res) => {
  try {
    const record = await Attendance.findOne({
      userId: req.user.id,
      date: todayDate(),
    });
    res.json({ record }); // null if not checked in
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── UPCOMING BIRTHDAYS — current month only (today → month end) ──
exports.UpcomingBday = async (req, res) => {
  try {
    const users = await UserFrom.find({
      bDate: { $exists: true, $ne: null },
      fullname: { $exists: true, $ne: "" },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const upcoming = users
      .map((u) => {
        const dob = new Date(u.bDate);
        if (Number.isNaN(dob.getTime())) return null;

        // Same calendar month only (not full year)
        if (dob.getMonth() !== currentMonth) return null;

        const next = new Date(currentYear, dob.getMonth(), dob.getDate());
        next.setHours(0, 0, 0, 0);

        // Already had birthday this month
        if (next < today) return null;

        const daysUntil = Math.round((next - today) / (1000 * 60 * 60 * 24));
        return {
          _id: u._id,
          name: u.fullname,
          dob: u.bDate,
          nextBirthday: next,
          daysUntil,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    res.json(upcoming);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//       admin penal change attedance
exports.getTodayAttendanceByUser = async (req, res) => {
  try {
    const record = await Attendance.findOne({
      userId: req.params.userId,
      date: todayDate(),
    });

    res.json({ record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getUserAttendance = async (req, res) => {
  try {
    const data = await Attendance.find({
      userId: req.params.userId,
    }).sort({ date: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
