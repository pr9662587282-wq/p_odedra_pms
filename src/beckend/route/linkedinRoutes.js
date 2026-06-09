const express = require("express");
const router = express.Router();
const passport = require("../controller/linkedinController");

router.get("/linkedin", passport.authenticate("linkedin"));

router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    res.redirect("http://localhost:5173/UserDeshboard");
  },
);

module.exports = router;
