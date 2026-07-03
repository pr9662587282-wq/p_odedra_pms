require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const http = require("http");
const { Server } = require("socket.io");
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

const leaveRoute = require("./route/leave"); // ← ADD leave
app.use("/leave", leaveRoute);
const googleDriveRoutes = require("./route/googleDriveRoutes");
const { googleCallback } = require("./controller/googleDriveController"); // ← यह नई लाइन जोड़ें

app.use("/api/google-drive", googleDriveRoutes);
app.get("/auth/google/callback", googleCallback); // ← यह नई लाइन जोड़ें

const chatRoutes = require("./route/chatRoutes");

console.log("chatRoutes type:", typeof chatRoutes); // debug line
app.use("/chat", chatRoutes);

app.use(profileRoute);

app.use(
  session({
    secret: "linkedin-secret",
    resave: false,
    saveUninitialized: true,
  }),
);

const fcmRoute = require("./route/fcmRoute");
app.use("/", fcmRoute);

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
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const onlineUsers = new Map(); // Track userId -> Set of active socket IDs

io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on("join", (userId) => {
    if (userId) {
      const cleanId = String(userId).replace(/["']/g, "");
      socket.userId = cleanId;

      if (!onlineUsers.has(cleanId)) {
        onlineUsers.set(cleanId, new Set());
      }
      onlineUsers.get(cleanId).add(socket.id);

      socket.join(cleanId);
      io.emit("online_users", Array.from(onlineUsers.keys()));
      console.log(`👤 User joined room: ${cleanId}`);
    }
  });

  socket.on("sendMessage", (data) => {
    const receiverId = data?.receiverId
      ? String(data.receiverId).replace(/["']/g, "")
      : null;
    if (receiverId) {
      io.to(receiverId).emit("receive_message", data);
    }
    if (data?.senderId) {
      const senderId = String(data.senderId).replace(/["']/g, "");
      io.to(senderId).emit("message_sent", data);
    }
  });

  socket.on("disconnect", () => {
    if (socket.userId && onlineUsers.has(socket.userId)) {
      const sockets = onlineUsers.get(socket.userId);
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineUsers.delete(socket.userId);
      }
      io.emit("online_users", Array.from(onlineUsers.keys()));
    }
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Login endpoint: http://localhost:${PORT}/login`);
  console.log(`🔌 Socket.IO ready on ws://localhost:${PORT}`);
});
