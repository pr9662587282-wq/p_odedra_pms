const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  role: String,
  groupId: {
    type: String,
    default: null,
  },
  fcmTokens: [{ type: String }],

  leaveBalance: {
    casual: {
      total: { type: Number, default: 12 },
      used: { type: Number, default: 0 },
    },
    sick: {
      total: { type: Number, default: 8 },
      used: { type: Number, default: 0 },
    },
    earned: {
      total: { type: Number, default: 15 },
      used: { type: Number, default: 0 },
    },
    unpaid: {
      total: { type: Number, default: 30 },
      used: { type: Number, default: 0 },
    },
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
