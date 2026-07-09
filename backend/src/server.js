require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Socket.IO configuration
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
