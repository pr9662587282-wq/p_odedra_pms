const mongoose = require("mongoose");

const userFromSchema = mongoose.Schema({
  email: String,
  role: String,
  fullname: String,

  joiningDate: Date,
  bDate: Date,
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  address: String,
  city: String,
  number: String,
});

const fromUser = mongoose.model("Userfrom", userFromSchema);
module.exports = fromUser;
