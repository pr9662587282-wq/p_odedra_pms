const http = require("http");
const Router = require("router");
const finalhandler = require("finalhandler");
const bodyParser = require("body-parser");
const UserController = require("./controller/UserController");
const AttendanceController = require("./controller/User_attendance");

const router = Router();

// Middleware to parse JSON bodies from Axios
router.use(bodyParser.json());

// CORS basic implementation (Manual, since you are using the 'router' package)
router.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,Authorization",
  );
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    return res.end();
  }
  next();
});

// --- AUTH ROUTES ---
router.post("/login", UserController.login);
router.post("/register", UserController.createUser);

// --- ATTENDANCE ROUTES ---
// We use the authMiddleware from UserController to protect these routes
router.post(
  "/attendance/check-in",
  UserController.authMiddleware,
  AttendanceController.checkIn,
);
router.post(
  "/attendance/check-out",
  UserController.authMiddleware,
  AttendanceController.checkOut,
);
router.post(
  "/attendance/break-in",
  UserController.authMiddleware,
  AttendanceController.breakIn,
);
router.post(
  "/attendance/break-out",
  UserController.authMiddleware,
  AttendanceController.breakOut,
);
router.get(
  "/attendance/my",
  UserController.authMiddleware,
  AttendanceController.getMyAttendance,
);
router.get(
  "/attendance/today",
  UserController.authMiddleware,
  AttendanceController.getTodayAttendance,
);

// --- OTHER ROUTES ---
router.get("/birthdays", AttendanceController.UpcomingBday);

const server = http.createServer((req, res) => {
  router(req, res, (err) => {
    const done = finalhandler(req, res);
    done(err);
  });
});

server.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
