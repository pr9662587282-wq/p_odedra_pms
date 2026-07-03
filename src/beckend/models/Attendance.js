const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    userId: String,
    date: String,
    checkIn: Date,
    checkOut: Date,
    checkInIp: { type: String, default: "—" }, // ← ADD
    checkOutIp: { type: String, default: "—" }, // ← ADD
    breaks: [
      {
        breakIn: Date,
        breakOut: Date,
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Attendance", attendanceSchema);
