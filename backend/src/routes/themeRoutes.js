const express = require("express");

const router = express.Router();

const { saveTheme, getTheme } = require("../controllers/themeController");
const { authMiddleware } = require("../controllers/UserController");

router.post("/save-theme", authMiddleware, saveTheme);

router.get("/get-theme", authMiddleware, getTheme);

module.exports = router;
