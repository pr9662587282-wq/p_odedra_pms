const express = require("express");
const router = express.Router();

const {
  updatePermission,
  getMyPermission,
  removePermission,
  updateAttendancePermission,
  updateTaskPermission,
  
} = require("../controller/permissionController");

const { authMiddleware } = require("../controller/UserController");

router.put("/update-permission/:id", updatePermission);

// show data
router.get("/my-permission", authMiddleware, getMyPermission);

router.delete("/remove-permission/:id", removePermission);

router.put("/permission/attendance/:id", updateAttendancePermission);
router.put("/permission/task/:id", updateTaskPermission);

module.exports = router;
