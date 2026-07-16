const Leave = require("../models/Leave");
const User = require("../models/User");
const Profile = require("../models/Profile");

// ── Helper: format Date → DD-MM-YYYY ─────────────────────────────
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// ── Helper: shape a Leave document for the frontend ───────────────
const shapeLeave = (l) => ({
  id: l._id,
  type: l.leaveType,
  from: formatDate(l.from),
  to: formatDate(l.to),
  days: l.days,
  reason: l.reason,
  status: l.status,
  appliedOn: formatDate(l.createdAt),
});

// Helper to map leave types to schema keys
const mapLeaveTypeToKey = (type) => {
  const t = String(type).toLowerCase();
  if (t.includes("casual")) return "casual";
  if (t.includes("sick")) return "sick";
  if (t.includes("earned") || t.includes("paid")) return "earned";
  if (t.includes("unpaid")) return "unpaid";
  return null;
};

// ── Apply Leave ───────────────────────────────────────────────────
const applyLeave = async (req, res) => {
  try {
    const { leaveType, from, to, days, reason } = req.body;

    if (!leaveType || !from || !to || !days || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const leave = await Leave.create({
      employee: req.user.id,
      leaveType,
      from: new Date(from),
      to: new Date(to),
      days: Number(days),
      reason,
    });

    res.status(201).json({
      message: "Leave applied successfully",
      leave: shapeLeave(leave),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get Leave History (only this user) ───────────────────────────
const getHistory = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(leaves.map(shapeLeave));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get Leave Balance ─────────────────────────────────────────────
const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("leaveBalance");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.leaveBalance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get All Leaves (Admin-only) ──────────────────────────────────
const getAllLeaves = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Fetch leaves and populate user email
    const leaves = await Leave.find().populate("employee", "email role").sort({
      createdAt: -1,
    });

    // Fetch user profiles to match fullName and profileImage
    const profiles = await Profile.find({});
    const profileMap = new Map(profiles.map((p) => [String(p.userId), p]));

    const formattedLeaves = leaves.map((l) => {
      const empId = l.employee ? String(l.employee._id) : null;
      const profile = empId ? profileMap.get(empId) : null;

      return {
        id: l._id,
        employeeId: empId,
        email: l.employee ? l.employee.email : "N/A",
        fullName:
          profile && profile.fullName
            ? profile.fullName
            : l.employee
              ? l.employee.email.split("@")[0]
              : "N/A",
        profileImage: profile ? profile.profileImage : "",
        type: l.leaveType,
        from: formatDate(l.from),
        to: formatDate(l.to),
        days: l.days,
        reason: l.reason,
        status: l.status,
        appliedOn: formatDate(l.createdAt),
      };
    });

    res.json(formattedLeaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Update Leave Status (Admin-only) ─────────────────────────────
const updateStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const { status } = req.body; // "Approved" or "Rejected" or "Pending"

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    const oldStatus = leave.status;
    leave.status = status;
    await leave.save();

    // Update leave balance of the user
    if (oldStatus !== status) {
      const balanceKey = mapLeaveTypeToKey(leave.leaveType);
      if (balanceKey) {
        const user = await User.findById(leave.employee);
        if (user) {
          let updated = false;

          if (!user.leaveBalance) {
            user.leaveBalance = {
              casual: { total: 12, used: 0 },
              sick: { total: 8, used: 0 },
              earned: { total: 15, used: 0 },
              unpaid: { total: 30, used: 0 },
            };
          }
          if (!user.leaveBalance[balanceKey]) {
            user.leaveBalance[balanceKey] = { total: 10, used: 0 };
          }

          if (status === "Approved" && oldStatus !== "Approved") {
            user.leaveBalance[balanceKey].used += leave.days;
            updated = true;
          } else if (status !== "Approved" && oldStatus === "Approved") {
            user.leaveBalance[balanceKey].used = Math.max(
              0,
              user.leaveBalance[balanceKey].used - leave.days,
            );
            updated = true;
          }

          if (updated) {
            user.markModified("leaveBalance");
            await user.save();
          }
        }
      }
    }

    res.json({
      message: `Leave status updated to ${status}`,
      leave: shapeLeave(leave),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  applyLeave,
  getHistory,
  getBalance,
  getAllLeaves,
  updateStatus,
};
