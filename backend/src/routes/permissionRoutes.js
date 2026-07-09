const express = require('express');
const router = express.Router();

const {
  updatePermission,
  getMyPermission,
  removePermission,
  updateAttendancePermission,
  updateTaskPermission,
} = require('../controllers/permissionController');

const { authMiddleware } = require('../controllers/userController');

router.put('/update-permission/:id', updatePermission);

// show data
router.get('/my-permission', authMiddleware, getMyPermission);

router.delete('/remove-permission/:id', removePermission);

router.put('/permission/attendance/:id', updateAttendancePermission);
router.put('/permission/task/:id', updateTaskPermission);

module.exports = router;
