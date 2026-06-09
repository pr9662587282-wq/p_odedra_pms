require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("./controller/linkedinController");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

const userRoutes = require("./route/UserRoute");
app.use("/", userRoutes);

const UserFromRoute = require("./route/UserFromRoute");
app.use("/", UserFromRoute);

// Attendance routes
const AttendanceRoute = require("./route/Attendance_route");
app.use("/", AttendanceRoute);

const themeRoutes = require("./route/themeRoutes");
app.use("/", themeRoutes);

const permissionRoutes = require("./route/permissionRoute");
app.use("/", permissionRoutes);

const profileRoute = require("./route/profileRoute");
app.use("/uploads", express.static("uploads"));

app.use(profileRoute);

app.use(
  session({
    secret: "linkedin-secret",
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(passport.initialize());
app.use(passport.session());
const linkedinRoutes = require("./route/linkedinRoutes");

app.use("/auth", linkedinRoutes);
// MongoDB connect (direct URL added)
mongoose
  .connect("mongodb://localhost:27017/testdb")
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));

// Test route
app.get("/", (req, res) => {
  res.send("OK");
});

// Server start
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Login endpoint: http://localhost:${PORT}/login`);
});
