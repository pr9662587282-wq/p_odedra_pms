const Permission = require("../models/Permission");

// UPDATE / SAVE PERMISSION

const updatePermission = async (req, res) => {
  try {
    const userId = req.params.id;
    const { viewer, editor, deletePermission } = req.body;

    let permission = await Permission.findOne({ userId });

    // AUTO CREATE
    if (!permission) {
      permission = new Permission({
        userId,
        viewer: true,
        editor: false,
        deletePermission: false,
        isLocked: false,
      });
    }

    //  LOCK CHECK (ONLY THIS)
    if (permission.isLocked) {
      return res.status(400).json({
        success: false,
        message: "Permission already locked",
      });
    }

    permission.viewer = viewer;
    permission.editor = editor;
    permission.deletePermission = deletePermission;

    //  LOCK AFTER SAVE
    permission.isLocked = true;

    await permission.save();

    res.json({
      success: true,
      message: "Permission Assigned Successfully",
      locked: true,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const getMyPermission = async (req, res) => {
  try {
    const userId = req.user.id;

    let permission = await Permission.findOne({ userId });

    //  IF NOT FOUND → RETURN DEFAULT PERMISSION
    if (!permission) {
      permission = {
        userId: userId, // Ensure userId is set
        viewer: true,
        editor: false,
        deletePermission: false,
        attendanceView: false,
        attendanceEdit: false,
        attendanceLocked: false,
        TaskView: false,
        TaskEdit: false,
      };
    }

    res.json(permission);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// REMOVE PERMISSION
const removePermission = async (req, res) => {
  try {
    const userId = req.params.id;

    await Permission.findOneAndDelete({ userId });

    res.json({
      success: true,
      message: "Permission Removed",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
const getPermissions = async (req, res) => {
  try {
    const data = await Permission.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// attedance
const updateAttendancePermission = async (req, res) => {
  try {
    const userId = req.params.id;
    const { attendanceView, attendanceEdit } = req.body;

    let permission = await Permission.findOne({ userId });

    if (!permission) {
      permission = new Permission({ userId });
    }

    if (permission.attendanceLocked) {
      return res.status(400).json({
        success: false,
        message: "Attendance permission already locked",
      });
    }

    // Apply updates
    permission.attendanceView = attendanceView;
    permission.attendanceEdit = attendanceEdit;

    //  Lock the tab after successful save
    permission.attendanceLocked = true;

    await permission.save();

    res.json({
      success: true,
      message: "Attendance Permission Saved and Locked",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTaskPermission = async (req, res) => {
  try {
    const userId = req.params.id;

    const { TaskView, TaskEdit } = req.body;

    let permission = await Permission.findOne({ userId });

    // AUTO CREATE
    if (!permission) {
      permission = new Permission({
        userId,
      });
    }

    // LOCK CHECK
    if (permission.taskLocked) {
      return res.status(400).json({
        success: false,
        message: "Task Permission Already Locked",
      });
    }

    // SAVE
    permission.TaskView = TaskView;
    permission.TaskEdit = TaskEdit;

    // LOCK AFTER SAVE
    permission.taskLocked = true;

    await permission.save();
    await permission.save();

    console.log("SAVED =", permission);
    console.log("BODY =", req.body);

    res.json({
      success: true,
      message: "Task Permission Saved Successfully",
      locked: true,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  updatePermission,
  getMyPermission,
  removePermission,
  getPermissions,
  updateAttendancePermission,
  updateTaskPermission,
};
