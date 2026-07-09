// Ensure this file starts with the line below and contains no frontend code at the top.

const Theme = require("../models/ThemeModel");

// SAVE THEME
const saveTheme = async (req, res) => {
  try {
    const { theme } = req.body;

    const userId = req.user.id;

    let existing = await Theme.findOne({ userId });

    if (existing) {
      existing.theme = theme;
      await existing.save();
    } else {
      await Theme.create({
        userId,
        theme,
      });
    }

    res.json({
      success: true,
      message: "Theme saved",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// GET THEME
const getTheme = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await Theme.findOne({ userId });

    res.json({
      theme: data?.theme || "light",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
module.exports = {
  saveTheme,
  getTheme,
};
