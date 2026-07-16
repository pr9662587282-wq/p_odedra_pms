require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env'),
});
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./controllers/linkedinController');
const connectDB = require('./config/database');

const app = express();

// Connect to Database
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'https://p-odedra-aqjzt31gd-prakash-odedras-projects.vercel.app',
  'https://p-odedra-pms-gamma.vercel.app',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'linkedin-secret',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Static uploads
app.use('/uploads', express.static('uploads'));

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/', userRoutes);

const userFormRoutes = require('./routes/userFormRoutes');
app.use('/', userFormRoutes);

const attendanceRoutes = require('./routes/attendanceRoutes');
app.use('/', attendanceRoutes);

const themeRoutes = require('./routes/themeRoutes');
app.use('/', themeRoutes);

const permissionRoutes = require('./routes/permissionRoutes');
app.use('/', permissionRoutes);

const profileRoutes = require('./routes/profileRoutes');
app.use(profileRoutes);

const leaveRoutes = require('./routes/leaveRoutes');
app.use('/leave', leaveRoutes);

const googleDriveRoutes = require('./routes/googleDriveRoutes');
const { googleCallback } = require('./controllers/googleDriveController');
app.use('/api/google-drive', googleDriveRoutes);
app.get('/auth/google/callback', googleCallback);

const chatRoutes = require('./routes/chatRoutes');
app.use('/chat', chatRoutes);

const fcmRoutes = require('./routes/fcmRoutes');
app.use('/', fcmRoutes);

const linkedinRoutes = require('./routes/linkedinRoutes');
app.use('/auth', linkedinRoutes);

// Health check — also shows FCM init status so you can verify Render env var
app.get('/health', (req, res) => {
  const { messaging } = require('./config/firebaseAdmin');
  res.json({
    status: 'OK',
    message: 'Server is running',
    fcm: messaging ? '✅ initialized' : '❌ NOT initialized — set FIREBASE_SERVICE_ACCOUNT_JSON on Render',
    env: {
      hasFirebaseEnv: !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
      nodeEnv: process.env.NODE_ENV,
    },
  });
});

module.exports = app;
