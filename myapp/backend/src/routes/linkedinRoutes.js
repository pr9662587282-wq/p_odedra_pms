const express = require("express");
const router = express.Router();
const passport = require("../controllers/linkedinController");

router.get("/linkedin", passport.authenticate("linkedin"));

router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/UserDeshboard`);
  },
);

module.exports = router;
