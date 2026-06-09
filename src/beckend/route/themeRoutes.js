const express = require("express");

const router = express.Router();

const { saveTheme, getTheme } = require("../controller/themeController");
const { authMiddleware } = require("../controller/UserController");

router.post("/save-theme", authMiddleware, saveTheme);

router.get("/get-theme", authMiddleware, getTheme);

module.exports = router;
