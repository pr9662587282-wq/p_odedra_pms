require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env'),
});
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const User = require('./models/User');
const { messaging } = require('./config/firebaseAdmin');

// Socket.IO configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://p-odedra-aqjzt31gd-prakash-odedras-projects.vercel.app',
  'https://p-odedra-pms-gamma.vercel.app',
];
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const onlineUsers = new Map(); // Track userId -> Set of active socket IDs

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on('join', (userId) => {
    if (userId) {
      const cleanId = String(userId).replace(/["']/g, '');
      socket.userId = cleanId;

      if (!onlineUsers.has(cleanId)) {
        onlineUsers.set(cleanId, new Set());
      }
      onlineUsers.get(cleanId).add(socket.id);

      socket.join(cleanId);
      io.emit('online_users', Array.from(onlineUsers.keys()));
      console.log(`👤 User joined room: ${cleanId}`);
    }
  });

  socket.on('sendMessage', (data) => {
    const receiverId = data?.receiverId ? String(data.receiverId).replace(/["']/g, '') : null;
    if (receiverId) {
      io.to(receiverId).emit('receive_message', data);
    }
    if (data?.senderId) {
      const senderId = String(data.senderId).replace(/["']/g, '');
      io.to(senderId).emit('message_sent', data);
    }
  });
  socket.on('call-user', ({ toUserId, fromUserId, fromName, offer }) => {
    const cleanTo = String(toUserId).replace(/["']/g, '');
    io.to(cleanTo).emit('incoming-call', { fromUserId, fromName, offer });
  });

  socket.on('call-answer', ({ toUserId, answer }) => {
    const cleanTo = String(toUserId).replace(/["']/g, '');
    io.to(cleanTo).emit('call-answered', { answer });
  });

  socket.on('ice-candidate', ({ toUserId, candidate }) => {
    const cleanTo = String(toUserId).replace(/["']/g, '');
    io.to(cleanTo).emit('ice-candidate', { candidate });
  });

  socket.on('call-rejected', ({ toUserId }) => {
    const cleanTo = String(toUserId).replace(/["']/g, '');
    io.to(cleanTo).emit('call-rejected');
  });

  socket.on('call-ended', ({ toUserId }) => {
    const cleanTo = String(toUserId).replace(/["']/g, '');
    io.to(cleanTo).emit('call-ended');
  });

  // ---------------- TYPING INDICATOR ----------------
  socket.on('typing', ({ toUserId }) => {
    const cleanTo = String(toUserId).replace(/["']/g, '');
    io.to(cleanTo).emit('user_typing', { fromUserId: socket.userId });
  });

  socket.on('message_reaction', async (data) => {
    const { messageId, emoji, userId, action } = data;
    const receiverId = data.toUserId ? String(data.toUserId).replace(/["']/g, '') : null;

    // 1. Relay live via socket (for open tabs — instant UI update)
    if (receiverId) {
      io.to(receiverId).emit('message_reaction', { messageId, emoji, userId, action });
    }
    if (socket.userId) {
      io.to(socket.userId).emit('message_reaction', { messageId, emoji, userId, action });
    }

    // 2. Send FCM push — only on 'add', and only to the message owner (not to yourself)
    if (action === 'add' && receiverId && receiverId !== socket.userId) {
      try {
        if (!messaging) {
          console.warn('⚠️ FCM not initialized — skipping reaction push');
          return;
        }

        const receiverUser = await User.findById(receiverId).select('fcmTokens');
        console.log(
          `🔥 FCM(reaction) | Receiver: ${receiverId} | Tokens: ${receiverUser?.fcmTokens?.length || 0}`
        );

        if (receiverUser?.fcmTokens?.length) {
          const reactorUser = await User.findById(userId).select('fullname email');
          const reactorName = reactorUser?.fullname || reactorUser?.email || 'Someone';
          const msgBody = `${reactorName} reacted ${emoji} to your message`;
          const chatUrl = `/chat?userId=${userId}`;

          const fcmPayload = {
            notification: { title: 'New Reaction', body: msgBody },
            data: {
              senderId: userId.toString(),
              senderName: reactorName,
              messageText: msgBody,
              url: chatUrl,
              type: 'reaction',
            },
            tokens: receiverUser.fcmTokens,
            android: {
              priority: 'high',
              notification: {
                channelId: 'chat_messages',
                priority: 'max',
                defaultSound: true,
                defaultVibrateTimings: true,
              },
            },
            webpush: {
              headers: { Urgency: 'high' },
              notification: {
                title: 'New Reaction',
                body: msgBody,
                icon: '/icons/notif-icon.png',
                badge: '/icons/badge-mono.png',
                tag: chatUrl,
                renotify: true,
              },
              fcmOptions: { link: chatUrl },
            },
          };

          const response = await messaging.sendEachForMulticast(fcmPayload);
          console.log(
            `🔥 FCM(reaction) sent | success:${response.successCount} fail:${response.failureCount}`
          );

          const invalidTokens = [];
          response.responses.forEach((r, idx) => {
            if (!r.success) {
              console.error(`❌ Reaction token[${idx}] failed: ${r.error?.message}`);
              invalidTokens.push(receiverUser.fcmTokens[idx]);
            }
          });
          if (invalidTokens.length) {
            await User.findByIdAndUpdate(receiverId, {
              $pull: { fcmTokens: { $in: invalidTokens } },
            });
          }
        }
      } catch (notifErr) {
        console.error('❌ FCM reaction push error:', notifErr.message);
      }
    }
  });
  // ----------------------------------------------------

  socket.on('disconnect', () => {
    if (socket.userId && onlineUsers.has(socket.userId)) {
      const sockets = onlineUsers.get(socket.userId);
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineUsers.delete(socket.userId);
      }
      io.emit('online_users', Array.from(onlineUsers.keys()));
    }
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Login endpoint: http://localhost:${PORT}/login`);
  console.log(`🔌 Socket.IO ready on ws://localhost:${PORT}`);
});
