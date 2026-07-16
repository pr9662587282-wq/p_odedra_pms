const express = require("express");

const {
  googleAuth,
  googleCallback,
  uploadDrive,
  upload,
} = require("../controller/googleDriveController");

const router = express.Router();

router.get("/auth", googleAuth);

router.get("/oauth2callback", googleCallback);

router.post("/upload-drive", upload.single("file"), uploadDrive);

module.exports = router;
