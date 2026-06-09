const mongoose = require("mongoose");

const modulePermissionSchema = new mongoose.Schema(
  {
    viewer: {
      type: Boolean,
      default: false,
    },
    editor: {
      type: Boolean,
      default: false,
    },
    deletePermission: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const permissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    profile: {
      type: modulePermissionSchema,
      default: () => ({
        viewer: true,
        editor: false,
        deletePermission: false,
      }),
    },
    attendance: {
      type: modulePermissionSchema,
      default: () => ({
        viewer: false,
        editor: false,
      }),
    },
    task: {
      type: modulePermissionSchema,
      default: () => ({
        viewer: false,
        editor: false,
      }),
    },
  },
  { timestamps: true },
);

const Permission = mongoose.model("Permission", permissionSchema);

module.exports = Permission;
