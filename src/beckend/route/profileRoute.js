const express = require("express");
const router = express.Router();

const {
  saveProfile,
  getMyProfile,
  getAllProfiles,
  updateProfilePermissions,
  getUserName, // Import the new function
  getProfileById,
  getMySimpleProfile,
  saveProfileById,
} = require("../controller/profileController");

const { getUserNames } = require("../controller/User_from_controller"); // Import getUserNames
const { authMiddleware } = require("../controller/UserController"); // Assuming this is for general auth

router.get("/Datalist", authMiddleware, getUserNames);
router.get("/Datalist_AllUsers", authMiddleware, getAllProfiles);

const upload = require("../image_upload/upload");
router.get("/get-username", authMiddleware, getUserName);
router.get("/profile/my", authMiddleware, getMySimpleProfile);

router.post(
  "/profile/me",
  authMiddleware,
  upload.single("profileImage"),
  saveProfile,
);

router.put(
  "/profile/:id",
  authMiddleware,
  upload.single("profileImage"),
  saveProfileById,
);

router.get("/profile/me", authMiddleware, getMyProfile);
router.get("/profile/:id", authMiddleware, getProfileById);

router.put("/update-permission/:id", authMiddleware, updateProfilePermissions); // New route for profile permissions

module.exports = router;
