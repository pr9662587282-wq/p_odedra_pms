const mongoose = require("mongoose");

const ThemeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  role: {
    type: String,
    enum: ["admin", "user"],
  },

  theme: {
    type: String,
    enum: ["light", "dark"],
    default: "light",
  },
});

module.exports = mongoose.model("Theme", ThemeSchema);
