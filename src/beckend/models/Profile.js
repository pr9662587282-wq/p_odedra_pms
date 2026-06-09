const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    fullName: { type: String, default: "" },
    personalEmail: { type: String, default: "" },
    companyEmail: { type: String, default: "" },

    gender: { type: String, default: "" },
    birthday: { type: String, default: "" },

    bloodGroup: { type: String, default: "" },
    nationality: { type: String, default: "" },

    maritalStatus: { type: String, default: "" },
    marriageAnniversary: { type: String, default: "" },

    status: { type: String, default: "Inactive" },

    department: { type: String, default: "" },
    designation: { type: String, default: "" },
    batch: { type: String, default: "" },
    reportTo: { type: String, default: "" },

    joiningDate: { type: String, default: "" },
    probationEndDate: { type: String, default: "" },

    workDuration: { type: String, default: "" },

    phone: { type: String, default: "" },
    alternatePhone: { type: String, default: "" },

    address: { type: String, default: "" },

    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },

    emergencyContactName: { type: String, default: "" },
    emergencyContactPhone: { type: String, default: "" },

    profileImage: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Profile", ProfileSchema);
