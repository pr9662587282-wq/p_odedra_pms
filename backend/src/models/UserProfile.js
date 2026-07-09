const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  basicInfo: {
    fullName: { type: String, default: null },
    personalEmail: { type: String, default: null },
    companyEmail: { type: String, default: null },
    gender: { type: String, default: null },
    birthday: { type: Date, default: null },
    bloodGroup: { type: String, default: null },
    nationality: { type: String, default: null },
    maritalStatus: { type: String, default: null },
    marriageAnniversary: { type: Date, default: null },
  },

  contactInfo: {
    phone: { type: String, default: null },
    alternatePhone: { type: String, default: null },
    address: { type: String, default: null },
    linkedin: { type: String, default: null },
    github: { type: String, default: null },
  },

  companyInfo: {
    department: { type: String, default: null },
    designation: { type: String, default: null },
    batch: { type: String, default: null },
    reportTo: { type: String, default: null },
    joiningDate: { type: Date, default: null },
    probationEndDate: { type: Date, default: null },
    workDuration: { type: String, default: null },
  },

  emergencyContact: {
    name: { type: String, default: null },
    phone: { type: String, default: null },
  },

  status: {
    type: String,
    default: "Inactive",
  },

  profileImage: {
    type: String,
    default: null,
  },

  // Cloudinary public id for the uploaded image — used to delete/replace images
  profileImageId: {
    type: String,
    default: null,
  },
  // Whether this user's profile image should be visible to other users/lists
  profileImageVisible: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("UserProfile", userProfileSchema);
