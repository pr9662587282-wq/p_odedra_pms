import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/admin/Dashboard";
import Sidebar_Admin from "./pages/admin/Sidebar_Admin";
import UserData from "./pages/admin/UserData";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import UserDashboard from "./pages/user/UserDashboard";
import UserForm from "./pages/user/UserForm";
import UserSidebar from "./pages/user/UserSidebar";
import ProfileEdit from "./pages/user/ProfileEdit";
import LeavePage from "./pages/user/LeavePage";
import AttendancePage from "./pages/user/AttendancePage";
import TaskPage from "./pages/user/TaskPage";
import TaskAdmin from "./pages/admin/TaskAdmin";
import EditBasicProfile from "./pages/user/EditBasicProfile";
import PermissionPage from "./pages/user/PermissionPage";
import AccessUserDashboard from "./pages/admin/AccessUserDashboard";
import ChatPage from "./pages/user/ChatPage";
import LeavePanel from "./pages/admin/LeavePanel";

import { Toaster } from "sonner";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <div>
      <ThemeProvider>
        <Toaster richColors position="top-right" />
        <div>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/deshbaord" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth-success" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/User_Data_Adminpenal" element={<UserData />} />
            <Route path="/UserDeshboard" element={<UserDashboard />} />
            <Route path="/UserDeshboard/:id" element={<UserDashboard />} />
            <Route path="/User_form" element={<UserForm />} />
            <Route path="/User_Sidebar" element={<UserSidebar />} />
            <Route path="/profile" element={<ProfileEdit />} />
            <Route path="/profile/:id" element={<ProfileEdit />} />
            <Route path="/leave" element={<LeavePage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/attendance/:id" element={<AttendancePage />} />
            <Route path="/tasks" element={<TaskPage />} />
            <Route path="/tasks/:id" element={<TaskPage />} />
            <Route path="/leaves" element={<LeavePanel />} />
            <Route path="/User_permission" element={<PermissionPage />} />
            <Route path="/Edit_basic_profile" element={<EditBasicProfile />} />
            <Route path="/Task_admin" element={<TaskAdmin />} />
            <Route path="/Access_user_dashboard" element={<AccessUserDashboard />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="*" element={<Navigate to="/register" replace />} />
          </Routes>
        </div>
      </ThemeProvider>
    </div>
  );
}

export default App;
