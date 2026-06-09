const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    userId: String,
    date: String, // "2026-05-19" — easy to query today

    checkIn: Date, // only once per day
    checkOut: Date, // only once per day

    // breaks is an ARRAY — multiple breaks allowed
    // each break = { breakIn: Date, breakOut: Date }
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
