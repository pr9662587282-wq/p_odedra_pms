import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar_Admin from "./Sidebar_Admin";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import {
  Users,
  User,
  ClipboardList,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

function Access_user_dashboard() {
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("user_dashboard");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch user email list using token-based auth
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${import.meta.env.VITE_API_URL}/user-names`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => console.error("Error:", err));
  }, []);

  const renderStaticDashboard = () => {
    if (!selectedUser) return null;

    const gradients = {
      user_dashboard: "from-blue-600 to-indigo-600",
      task_dashboard: "from-violet-600 to-purple-600",
      profile_dashboard: "from-emerald-600 to-teal-600",
    };

    return (
      <div className="space-y-6 mt-6">
        <Button
          variant="ghost"
          onClick={() => setSelectedUser(null)}
          className="rounded-xl hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to User List
        </Button>

        <div
          className={`bg-gradient-to-r ${gradients[activeTab]} p-8 rounded-[2.5rem] text-white shadow-lg`}
        >
          <h3 className="text-2xl font-black capitalize">
            {activeTab.replace("_", " ")}
          </h3>
          <p className="text-white/80 font-medium mt-2">
            Email: {selectedUser.email}
          </p>
          <div className="mt-4 inline-block bg-white/20 px-4 py-1 rounded-full text-xs font-mono">
            User ID: {selectedUser._id}
          </div>
        </div>

        {activeTab === "user_dashboard" && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Attendance", value: "94%" },
              { label: "Active Tasks", value: "5" },
              { label: "Leaves", value: "2" },
              { label: "Efficiency", value: "88%" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 shadow-sm"
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {stat.label}
                </p>
                <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "task_dashboard" && (
          <div className="space-y-3">
            {[
              "UI Design Implementation",
              "Backend Auth Logic",
              "Database Migration",
            ].map((task, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 flex justify-between items-center"
              >
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {task}
                </span>
                <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full uppercase">
                  In Progress
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "profile_dashboard" && (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Login Email
              </p>
              <p className="font-bold text-slate-800 dark:text-white">
                {selectedUser.email}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                System Role
              </p>
              <p className="font-bold text-blue-600 uppercase">
                {selectedUser.role}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Sidebar_Admin />
      <div className="md:ml-72 p-6 min-h-screen bg-slate-50/50">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-5xl rounded-[2.5rem] border-0 bg-white shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="p-8 bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-4 rounded-3xl shadow-lg">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-black text-slate-800 tracking-tight">
                    Admin Control Panel
                  </DialogTitle>
                  <p className="text-sm text-slate-500 font-medium">
                    Monitoring organization metrics
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="p-8">
              {/* TAB NAVIGATION */}
              <div className="flex flex-wrap gap-3 border-b border-slate-100 pb-6">
                {[
                  {
                    id: "user_dashboard",
                    label: "User Dashboard",
                    icon: Users,
                  },
                  {
                    id: "task_dashboard",
                    label: "Task Dashboard",
                    icon: ClipboardList,
                  },
                  {
                    id: "profile_dashboard",
                    label: "Profile Dashboard",
                    icon: User,
                  },
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "outline"}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSelectedUser(null);
                    }}
                    className="flex items-center gap-2 rounded-2xl h-11 px-6 font-bold"
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </Button>
                ))}
              </div>

              {/* LIST OR DASHBOARD */}
              {!selectedUser ? (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-5 py-3">
                    <span className="font-bold text-slate-400 text-xs uppercase tracking-widest">
                      Select User Email:
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map((user) => (
                      <div
                        key={user._id}
                        onClick={() => setSelectedUser(user)}
                        className="group cursor-pointer bg-white border border-slate-200 rounded-[2rem] p-5 shadow-sm hover:border-blue-500 hover:ring-4 hover:ring-blue-500/10 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-slate-100 p-3 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <User className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate">
                              {user.email}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                              Role: {user.role}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                renderStaticDashboard()
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

export default Access_user_dashboard;
