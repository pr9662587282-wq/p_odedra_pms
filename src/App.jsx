import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./admin_penal/Dashboard";
import Sidebar_Admin from "./admin_penal/Sidebar_Admin";
import User_Data_Adminpenal from "./admin_penal/User_Data_Adminpenal";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Forget_password from "./auth/Forget_password";
import UserDeshboard from "./userPenal/UserDeshboard";
import User_form from "./userPenal/User_form";
import User_Sidebar from "./userPenal/User_Sidebar";
import User_profile_Edit from "./userPenal/User_profile_Edit";
import User_leave_add from "./userPenal/User_leave_add";
import Attendance_show from "./userPenal/Attendance_show";
import Task_show from "./userPenal/Task_show";
import Task_admin from "./admin_penal/Task_admin";
import Edit_basic_profile from "./userPenal/Edit_basic_profile";

import User_permission from "./userPenal/User_permission";
import Access_user_dashboard from "./admin_penal/Access_user_deshbaord";

// 💡 LinkedInCallback import ki ab zaroorat nahi hai kyunki hum Login file use kar rahe hain

import { Toaster } from "sonner";
import { ThemeProvider } from "./Theme/ThemeContext";

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

            {/* 🔥 VVIP CHANGE: Ise wildcard (*) ke upar rakha hai taaki React Router ise pehle read kare */}
            <Route path="/auth-success" element={<Login />} />

            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<Forget_password />} />
            <Route
              path="/User_Data_Adminpenal"
              element={<User_Data_Adminpenal />}
            />
            <Route path="/UserDeshboard" element={<UserDeshboard />} />
            <Route path="/UserDeshboard/:id" element={<UserDeshboard />} />
            <Route path="/User_form" element={<User_form />} />
            <Route path="/User_Sidebar" element={<User_Sidebar />} />
            <Route path="/profile" element={<User_profile_Edit />} />
            <Route path="/profile/:id" element={<User_profile_Edit />} />
            <Route path="/leave" element={<User_leave_add />} />
            <Route path="/attendance" element={<Attendance_show />} />
            <Route path="/attendance/:id" element={<Attendance_show />} />
            <Route path="/tasks" element={<Task_show />} />
            <Route path="/tasks/:id" element={<Task_show />} />

            <Route path="/User_permission" element={<User_permission />} />
            <Route
              path="/Edit_basic_profile"
              element={<Edit_basic_profile />}
            />
            <Route path="/profile/:id" element={<Edit_basic_profile />} />

            <Route path="/Task_admin" element={<Task_admin />} />

            <Route
              path="/Access_user_dashboard"
              element={<Access_user_dashboard />}
            />

            {/* 🚨 Catch-all/Wildcard route humesha sabse AAKHRI mein hona chahiye */}
            <Route path="*" element={<Navigate to="/register" replace />} />
          </Routes>
        </div>
      </ThemeProvider>
    </div>
  );
}

export default App;
