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
const pendingCalls = new Map(); // calleeId -> { fromUserId, fromName, offer, timestamp }
const PENDING_CALL_TTL = 30000; // 30s — don't resurrect stale/expired calls // Track userId -> Set of active socket IDs

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

      // If this user has an unanswered call waiting (they opened the app
      // from a push notification, missing the original live socket emit),
      // re-deliver the offer now that they're actually connected.
      const pending = pendingCalls.get(cleanId);
      if (pending) {
        if (Date.now() - pending.timestamp < PENDING_CALL_TTL) {
          console.log(`📞 Redelivering pending call to ${cleanId}`);
          socket.emit('incoming-call', {
            fromUserId: pending.fromUserId,
            fromName: pending.fromName,
            offer: pending.offer,
          });
        } else {
          pendingCalls.delete(cleanId); // expired, caller already gave up
        }
      }
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
  socket.on('call-user', async ({ toUserId, fromUserId, fromName, offer }) => {
    const cleanTo = String(toUserId).replace(/["']/g, '');

    // Remember this call so it can be redelivered if the callee's app
    // wasn't connected yet (e.g. they had to open it from a push notification)
    pendingCalls.set(cleanTo, { fromUserId, fromName, offer, timestamp: Date.now() });

    // 1. Keep the live socket relay — instant if the tab is already open
    io.to(cleanTo).emit('incoming-call', { fromUserId, fromName, offer });

    // 2. ALSO send a real FCM push — reaches the callee even if the tab
    //    is closed/backgrounded, same as your message/reaction pushes
    try {
      if (!messaging) {
        console.warn('⚠️ FCM not initialized — skipping call push');
        return;
      }

      const receiverUser = await User.findById(cleanTo).select('fcmTokens');
      console.log(
        `🔥 FCM(call) | Receiver: ${cleanTo} | Tokens: ${receiverUser?.fcmTokens?.length || 0}`
      );

      if (receiverUser?.fcmTokens?.length) {
        const chatUrl = `/chat?userId=${fromUserId}`;

        // NOTE: do NOT put the SDP offer here — FCM data payloads cap at ~4KB
        // and offers can exceed that. This push is only a wake-up signal;
        // the real offer arrives via the socket event once the tab is open.
        const fcmPayload = {
          notification: {
            title: `📞 Incoming call — ${fromName || 'Someone'}`,
            body: 'Tap to answer',
          },
          data: {
            type: 'incoming_call',
            fromUserId: String(fromUserId),
            fromName: fromName || 'Someone',
            url: chatUrl,
          },
          tokens: receiverUser.fcmTokens,
          android: {
            priority: 'high',
            notification: {
              channelId: 'chat_calls',
              priority: 'max',
              defaultSound: true,
              defaultVibrateTimings: true,
              clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            },
          },
          webpush: {
            headers: { Urgency: 'high' },
            notification: {
              title: `📞 Incoming call — ${fromName || 'Someone'}`,
              body: 'Tap to answer',
              icon: '/icons/notif-icon.png',
              badge: '/icons/badge-mono.png',
              tag: `call-${fromUserId}`,
              renotify: true,
              requireInteraction: true,
              vibrate: [300, 100, 300, 100, 300],
              actions: [
                { action: 'accept', title: '✅ Accept' },
                { action: 'decline', title: '❌ Decline' },
              ],
            },
            fcmOptions: { link: chatUrl },
          },
        };

        const response = await messaging.sendEachForMulticast(fcmPayload);
        console.log(
          `🔥 FCM(call) sent | success:${response.successCount} fail:${response.failureCount}`
        );

        const invalidTokens = [];
        response.responses.forEach((r, idx) => {
          if (!r.success) {
            console.error(`❌ Call token[${idx}] failed: ${r.error?.message}`);
            invalidTokens.push(receiverUser.fcmTokens[idx]);
          }
        });
        if (invalidTokens.length) {
          await User.findByIdAndUpdate(cleanTo, {
            $pull: { fcmTokens: { $in: invalidTokens } },
          });
        }
      }
    } catch (notifErr) {
      console.error('❌ FCM call push error:', notifErr.message);
    }
  });

  socket.on('call-answer', ({ toUserId, answer }) => {
    const cleanTo = String(toUserId).replace(/["']/g, '');
    io.to(cleanTo).emit('call-answered', { answer });
    // The call was answered — the caller (toUserId here) no longer needs
    // their pending entry cleared; the callee is socket.userId
    if (socket.userId) pendingCalls.delete(socket.userId);
  });

  socket.on('ice-candidate', ({ toUserId, candidate }) => {
    const cleanTo = String(toUserId).replace(/["']/g, '');
    io.to(cleanTo).emit('ice-candidate', { candidate });
  });

  socket.on('call-rejected', ({ toUserId }) => {
    const cleanTo = String(toUserId).replace(/["']/g, '');
    io.to(cleanTo).emit('call-rejected');
    if (socket.userId) pendingCalls.delete(socket.userId);
  });
  socket.on('call-ended', ({ toUserId }) => {
    const cleanTo = String(toUserId).replace(/["']/g, '');
    io.to(cleanTo).emit('call-ended');
    if (socket.userId) pendingCalls.delete(socket.userId);
    pendingCalls.delete(cleanTo);
  });

  // Callee opened app from notification — ask caller to resend offer
  socket.on('call-ready', ({ toUserId, fromUserId }) => {
    const cleanTo = String(toUserId).replace(/["']/g, '');
    console.log(`📞 call-ready from ${fromUserId} → relaying to caller ${cleanTo}`);
    io.to(cleanTo).emit('call-ready', { fromUserId });
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
