const Attendance = require("../models/Attendance");
const UserFrom = require("../models/User_fromdata");
const Leave = require("../models/Leave");

// Today's date string "2026-05-19"
function todayDate() {
  return new Date().toISOString().split("T")[0];
}

// ── CHECK IN — only once per day ──
/*exports.checkIn = async (req, res) => {
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
};*/

// ── CHECK IN — save IP ──
exports.checkIn = async (req, res) => {
  try {
    const existing = await Attendance.findOne({
      userId: req.user.id,
      date: todayDate(),
    });

    if (existing) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    // ── get real IP (works behind proxies too) ──
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "—";

    const data = await Attendance.create({
      userId: req.user.id,
      date: todayDate(),
      checkIn: new Date(),
      checkInIp: ip, // ← ADD
      breaks: [],
    });

    res.json({ message: "Checked In", data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── CHECK OUT — save IP ──
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

    // ── get real IP ──
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "—";

    record.checkOut = new Date();
    record.checkOutIp = ip; // ← ADD
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

// ── GET ATTENDANCE HISTORY (formatted for Attendance_show.jsx) ──
exports.getAttendanceHistory = async (req, res) => {
  try {
    const records = await Attendance.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .lean();

    const formatted = records.map((r) => {
      // helper: Date → "10:09 AM"
      const fmtTime = (d) => {
        if (!d) return "—";
        return new Date(d).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      };

      // helper: Date → "19-05-2026"
      const fmtDate = (d) => {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      };

      // total break minutes across all breaks
      const breaks = r.breaks || [];
      let totalBreakMin = 0;
      breaks.forEach((b) => {
        if (b.breakIn && b.breakOut) {
          totalBreakMin += (new Date(b.breakOut) - new Date(b.breakIn)) / 60000;
        }
      });

      // break time string e.g. "1:05"
      const breakHrs = Math.floor(totalBreakMin / 60);
      const breakMins = Math.round(totalBreakMin % 60);
      const breakTime =
        totalBreakMin > 0
          ? `${breakHrs}:${String(breakMins).padStart(2, "0")}`
          : "—";

      // net work hours e.g. "8 hrs 45 mins"
      let workHours = "—";
      if (r.checkIn && r.checkOut) {
        const netMin =
          (new Date(r.checkOut) - new Date(r.checkIn)) / 60000 - totalBreakMin;
        const wh = Math.floor(netMin / 60);
        const wm = Math.round(netMin % 60);
        workHours = `${wh} hrs ${wm} mins`;
      }

      return {
        _id: r._id,
        date: fmtDate(r.checkIn),
        entry: fmtTime(r.checkIn),
        exit: fmtTime(r.checkOut),
        breakTime,
        workHours,
        checkInIp: r.checkInIp || "—",
        checkOutIp: r.checkOutIp || "—",
      };
    });

    res.json({ success: true, records: formatted });
  } catch (err) {
    console.error("getAttendanceHistory error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
// ── helper: "10:09 AM" + "2026-05-19" -> Date object ──
function parseTimeToDate(timeStr, dateStr) {
  if (!timeStr || timeStr === "—") return null;
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier?.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (modifier?.toUpperCase() === "AM" && hours === 12) hours = 0;

  const d = new Date(dateStr);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

// ── UPDATE ATTENDANCE (admin edit) ──
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { entry, exit, breakTime } = req.body;

    const record = await Attendance.findById(id);
    if (!record) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    if (entry) {
      record.checkIn = parseTimeToDate(entry, record.date);
    }
    if (exit !== undefined) {
      record.checkOut =
        exit && exit !== "—" ? parseTimeToDate(exit, record.date) : null;
    }

    // ── rebuild breaks as one synthetic block matching the requested duration ──
    if (breakTime && breakTime !== "—" && record.checkIn) {
      const [bh, bm] = breakTime.split(":").map((n) => parseInt(n) || 0);
      const breakMin = bh * 60 + bm;

      if (breakMin > 0) {
        const breakStart = new Date(record.checkIn);
        breakStart.setMinutes(breakStart.getMinutes() + 30); // small buffer after check-in
        const breakEnd = new Date(breakStart);
        breakEnd.setMinutes(breakEnd.getMinutes() + breakMin);
        record.breaks = [{ breakIn: breakStart, breakOut: breakEnd }];
      } else {
        record.breaks = [];
      }
    } else {
      record.breaks = [];
    }

    await record.save();

    res.json({ success: true, message: "Attendance updated", data: record });
  } catch (err) {
    console.error("updateAttendance error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE ATTENDANCE (admin delete) ──
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Attendance.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    res.json({ success: true, message: "Attendance deleted" });
  } catch (err) {
    console.error("deleteAttendance error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
const User = require("../models/User"); //  ADD — top pe import karo

exports.getMonthlyAttendanceRate = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({
        success: false,
        message: "Month is required",
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const todayStart = new Date(`${today}T00:00:00.000Z`);
    const todayEnd = new Date(`${today}T23:59:59.999Z`);

    //  FIXED — koi role filter nahi, /user-names jaisa poora count
    const totalUsers = await User.countDocuments();

    const present = await Attendance.countDocuments({
      date: today,
    });

    const onLeaveUsers = await Leave.distinct("employee", {
      status: "Approved",
      from: { $lte: todayEnd },
      to: { $gte: todayStart },
    });
    const onLeave = onLeaveUsers.length;

    const absent = Math.max(0, totalUsers - present - onLeave);

    const start = new Date(`${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const attendance = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: start.toISOString().split("T")[0],
            $lt: end.toISOString().split("T")[0],
          },
        },
      },
      {
        $group: {
          _id: "$date",
          users: { $addToSet: "$userId" },
        },
      },
      {
        $project: {
          date: "$_id",
          presentCount: { $size: "$users" },
        },
      },
    ]);

    let totalRate = 0;
    attendance.forEach((d) => {
      totalRate += (d.presentCount / totalUsers) * 100;
    });

    const monthlyRate =
      attendance.length > 0 ? totalRate / attendance.length : 0;

    res.json({
      success: true,
      monthlyRate: Number(monthlyRate.toFixed(2)),
      totalUsers,
      present,
      absent,
      onLeave,
    });
  } catch (err) {
    console.error("Monthly Attendance Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
      stack: err.stack,
    });
  }
};
