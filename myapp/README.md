# Employee Management System

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing employees, attendance, leaves, tasks, and real-time chat.

## Project Structure

```
myapp/
├── frontend/               # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/         # Images, icons
│   │   ├── components/     # Reusable UI components (Shadcn/UI)
│   │   ├── context/        # React Context (Theme, Auth)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── layouts/        # Admin/User layouts
│   │   ├── pages/
│   │   │   ├── admin/      # Admin panel pages
│   │   │   ├── auth/       # Login, Register, ForgotPassword
│   │   │   └── user/       # User dashboard pages
│   │   ├── routes/         # React Router + Protected routes
│   │   ├── services/       # Axios API calls / Firebase
│   │   ├── utils/          # Helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/                # Express + MongoDB backend
│   ├── src/
│   │   ├── app.js          # Express app setup
│   │   ├── server.js       # HTTP server + Socket.IO
│   │   ├── config/         # DB, Cloudinary, Firebase config
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/      # Auth, admin-only, upload
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Reusable backend services
│   │   ├── utils/          # Helper functions
│   │   └── validators/     # Request validation
│   ├── .env.example
│   └── package.json
│
├── .github/workflows/      # GitHub Actions CI
├── .husky/                 # Git hooks
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
cp .env.example .env    # Fill in your credentials
npm install
npm run dev             # Starts on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env    # Fill in your credentials
npm install
npm run dev             # Starts on http://localhost:5173
```

## Features

- **Authentication**: Email/password, Google OAuth, LinkedIn OAuth, GitHub OAuth, Phone OTP
- **Employee Management**: Admin creates users, assigns roles and permissions
- **Attendance Tracking**: Check-in/out, breaks, IP logging, admin editing
- **Leave Management**: Apply, approve/reject, leave balance tracking
- **Real-time Chat**: Socket.IO powered chat with image uploads and push notifications
- **Profile Management**: Detailed profiles with Cloudinary image uploads
- **Permission System**: Granular access control per user (view/edit/delete)
- **Theme Support**: Light/dark mode preference saved per user

## Tech Stack

**Frontend**: React 19, Vite, React Router v7, Tailwind CSS, Shadcn/UI, Axios, Socket.IO-client

**Backend**: Node.js, Express 5, MongoDB, Mongoose, JWT, Socket.IO, Cloudinary, Firebase Admin, Passport.js
