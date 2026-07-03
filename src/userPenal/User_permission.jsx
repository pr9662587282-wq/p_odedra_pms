import React, { useEffect, useState } from "react";
import axios from "axios";
import User_Sidebar from "./User_Sidebar";
import { useNavigate } from "react-router-dom";

function User_permission() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");

  const [permissions, setPermissions] = useState({
    profile: {
      viewer: true,
      editor: false,
      deletePermission: false,
    },
    attendance: {
      viewer: false,
      editor: false,
    },
    task: {
      viewer: false,
      editor: false,
    },
  });

  const canViewProfile = permissions.profile.viewer;
  const canEditProfile = permissions.profile.editor;
  const canDeleteProfile = permissions.profile.deletePermission;

  const canViewAttendance = permissions.attendance.viewer;
  const canEditAttendance = permissions.attendance.editor;

  const canViewTask = permissions.task.viewer;
  const canEditTask = permissions.task.editor;
  const navigate = useNavigate();

  const handleAssignTask = (id) => {
    alert(`Assigning task to user: ${id}`);
  };

  // ---------------------------------
  // GET USER PERMISSION
  // ---------------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:5000/my-permission", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("PROFILE PERMISSION =", res.data.profile);
        console.log("MY ROLE =", res.data);
        setPermissions({
          profile: {
            viewer: res.data.profile?.viewer ?? true,
            editor: res.data.profile?.editor ?? false,
            deletePermission: res.data.profile?.deletePermission ?? false,
          },
          attendance: {
            viewer: res.data.attendance?.viewer ?? false,
            editor: res.data.attendance?.editor ?? false,
          },
          task: {
            viewer: res.data.task?.viewer ?? false,
            editor: res.data.task?.editor ?? false,
          },
        });
      })
      .catch((err) => console.log(err));
  }, []);
  // ---------------------------------
  // GET DATA
  // ---------------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/Datalist_AllUsers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  // ---------------------------------
  // DELETE
  // ---------------------------------
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/DeleteUser/${id}`);

      setData((prev) => prev.filter((item) => item._id !== id));

      alert("Deleted");
    } catch (err) {
      console.log(err);
    }
  };
  console.log("permissions =", permissions);
  console.log("canEditProfile =", canEditProfile);
  console.log("canDeleteProfile =", canDeleteProfile);
  console.log("DATA LENGTH =", data.length);

  return (
    <div className="flex min-h-screen">
      <User_Sidebar />
      <div className="flex-1 p-3 md:p-6 md:ml-72 overflow-x-auto bg-slate-50/50 mt-[-10px]">
        {/* TOP */}
        <div className="rounded-[2rem] border border-slate-200/60 bg-white/80 px-6 py-2 shadow-xl shadow-slate-200/40 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/80 mb-2">
          <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-500">
                User Directory
              </p>
              <h1 className="mt-0 text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Manage Users
              </h1>
            </div>

            <input
              type="text"
              placeholder="Search users or roles..."
              className="h-12 w-full md:w-80 rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 text-sm font-medium outline-none transition-all focus:border-indigo-500/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-800/50"
            />
          </div>

          {/* TABS — only show tabs user has access to */}
          <div className="flex gap-2 mt-2 border-t border-slate-100 pt-2 overflow-x-auto no-scrollbar">
            {/* Profile tab — always visible (viewer is true by default) */}
            {canViewProfile && (
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === "profile"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                Profile
              </button>
            )}

            {/* Attendance tab — only if viewer permission */}
            {canViewAttendance && (
              <button
                onClick={() => setActiveTab("attendance")}
                className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === "attendance"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                Attendance
              </button>
            )}

            {/* Task tab — only if viewer permission */}
            {canViewTask && (
              <button
                onClick={() => setActiveTab("task")}
                className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === "task"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                Task
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        {activeTab === "profile" && canViewProfile && (
          <div className="overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white shadow-2xl shadow-slate-200/50 dark:border-slate-800/60 dark:bg-slate-900 overflow-x-auto mt-2">
            <table className="w-full min-w-[1100px] border-collapse text-left text-[15px]">
              <thead className="bg-slate-50/40 text-[13px] font-black uppercase tracking-[0.15em] text-slate-400 dark:bg-slate-800/40">
                <tr className="text-left">
                  <th className="border-b border-slate-100/60 px-6 py-6 dark:border-slate-800">
                    User
                  </th>
                  <th className="border-b border-slate-100/60 px-6 py-6 dark:border-slate-800">
                    Address
                  </th>
                  <th className="border-b border-slate-100/60 px-6 py-6 dark:border-slate-800">
                    Role
                  </th>
                  <th className="border-b border-slate-100/60 px-6 py-6 dark:border-slate-800">
                    Email
                  </th>
                  <th className="border-b border-slate-100/60 px-6 py-6 dark:border-slate-800">
                    Contact
                  </th>
                  <th className="border-b border-slate-100/60 px-6 py-6 dark:border-slate-800">
                    Tenure
                  </th>
                  {(canEditProfile || canDeleteProfile) && (
                    <th className="border-b border-slate-100/60 px-6 py-6 dark:border-slate-800 text-right">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {data.map((item, index) => (
                  <tr
                    key={item._id}
                    className="group transition-all duration-300 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {(() => {
                            const itemVisible =
                              item.profileImageVisible === undefined
                                ? true
                                : item.profileImageVisible === true ||
                                  item.profileImageVisible === "true";
                            const showImage =
                              canViewProfile && itemVisible && item.profileImage;

                            if (showImage) {
                              const src =
                                typeof item.profileImage === "string" &&
                                (item.profileImage.startsWith("http") ||
                                  item.profileImage.startsWith("https") ||
                                  item.profileImage.startsWith("data:"))
                                  ? item.profileImage
                                  : `data:image/png;base64,${item.profileImage}`;

                              return (
                                <>
                                  <img
                                    className="h-12 w-12 rounded-[1.25rem] object-cover ring-4 ring-slate-50 transition-transform duration-300 group-hover:scale-110 dark:ring-slate-800"
                                    src={src}
                                    alt="User avatar"
                                  />
                                  <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-4 border-white bg-emerald-500 dark:border-slate-900"></span>
                                </>
                              );
                            }

                            return (
                              <img
                                className="h-12 w-12 rounded-[1.25rem] object-cover ring-4 ring-slate-50 transition-transform duration-300 group-hover:scale-110 dark:ring-slate-800"
                                src={`https://i.pravatar.cc/100?img=${index}`}
                                alt="User avatar"
                              />
                            );
                          })()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-black text-slate-800 dark:text-white">
                            {item.fullname}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                            {item.gender}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-slate-500 dark:text-slate-400">
                        {item.address}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                          {item.designation}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          {item.birthday
                            ? new Date(item.birthday).toLocaleDateString()
                            : "-"}{" "}
                          (B'day)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex rounded-xl bg-indigo-50 px-3 py-1.5 text-sm font-black text-indigo-600 ring-1 ring-indigo-500/10 dark:bg-indigo-500/10 dark:text-indigo-400">
                        {item.personalEmail}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-mono text-sm font-black text-slate-600 dark:text-slate-400">
                        {item.phone}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-slate-400">
                        {item.joiningDate
                          ? new Date(item.joiningDate).toLocaleDateString()
                          : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {/* Edit — only if editor permission */}
                        {canEditProfile && (
                          <button
                            onClick={() => {
                              const targetId =
                                typeof item.userId === "object"
                                  ? item.userId._id || item.userId.toString()
                                  : item.userId;
                              navigate(`/profile/${targetId}`, {
                                state: { fromAdmin: true },
                              });
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-all hover:bg-blue-600 hover:text-white dark:bg-blue-500/10"
                            title="Edit Profile"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                        )}
                        {/* Delete — only if deletePermission */}
                        {canDeleteProfile && (
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 transition-all hover:bg-rose-600 hover:text-white dark:bg-rose-500/10"
                            title="Delete User"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                        {/* Viewer only — no action buttons, show nothing */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {canViewProfile && !canEditProfile && !canDeleteProfile && (
              <div className="p-5 bg-slate-50/50 border-t border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                👁️ Profile Viewer Mode — No edit or delete access
              </div>
            )}
          </div>
        )}

        {activeTab === "attendance" && canViewAttendance && (
          <div className="overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white shadow-2xl shadow-slate-200/50 dark:border-slate-800/60 dark:bg-slate-900 overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
              <thead className="bg-slate-50/40 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 dark:bg-slate-800/40">
                <tr className="text-left">
                  <th className="border-b border-slate-100/60 px-6 py-6 dark:border-slate-800">
                    User
                  </th>
                  <th className="border-b border-slate-100/60 px-6 py-6 dark:border-slate-800">
                    Auth Detail
                  </th>
                  <th className="border-b border-slate-100/60 px-6 py-6 dark:border-slate-800">
                    Shift Log
                  </th>
                  <th className="border-b border-slate-100/60 px-6 py-6 dark:border-slate-800 text-right">
                    Status
                  </th>
                  {canEditAttendance && (
                    <th className="border-b border-slate-100/60 px-6 py-6 dark:border-slate-800 text-right">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {data.map((item, index) => (
                  <tr
                    key={item._id}
                    className="group transition-all duration-300 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <img
                          className="h-10 w-10 rounded-2xl object-cover ring-2 ring-slate-100"
                          src={`https://i.pravatar.cc/100?img=${index + 1}`}
                          alt=""
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 dark:text-white">
                            {item.fullname}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            {item.city}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          {item.email || "—"}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-black">
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                            Login
                          </span>
                          <span className="text-xs font-bold text-indigo-600">
                            {item.loginTime || "09:30 AM"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                            Worked
                          </span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {item.workingHours || "8.5h"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="inline-flex rounded-xl bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 ring-1 ring-emerald-500/20">
                        Present
                      </span>
                    </td>
                    {canEditAttendance && (
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => alert("Edit accessible")}
                          className="h-8 rounded-xl bg-indigo-600 px-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-indigo-700"
                        >
                          Update
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {canViewAttendance && !canEditAttendance && (
              <div className="p-5 bg-slate-50/50 border-t border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                👁️ Attendance Viewer Mode — No edit access
              </div>
            )}
          </div>
        )}

        {activeTab === "task" && canViewTask && (
          <div className="overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white shadow-2xl shadow-slate-200/50 dark:border-slate-800/60 dark:bg-slate-900 overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-left text-sm">
              <thead className="bg-slate-50/40 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 dark:bg-slate-800/40">
                <tr className="text-left">
                  <th className="border-b border-slate-100/60 px-6 py-6 dark:border-slate-800">
                    Assignee
                  </th>
                  <th className="border-b border-slate-100/60 px-6 py-6 dark:border-slate-800">
                    Communication
                  </th>
                  <th className="border-b border-slate-100/60 px-6 py-6 dark:border-slate-800 text-right">
                    Task Control
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {[
                  {
                    id: 1,
                    fullname: "Rahul Sharma",
                    email: "rahul@gmail.com",
                    phone: "9876543210",
                  },
                  {
                    id: 2,
                    fullname: "Amit Patel",
                    email: "amit@gmail.com",
                    phone: "9999999999",
                  },
                  {
                    id: 3,
                    fullname: "Neha Verma",
                    email: "neha@gmail.com",
                    phone: "8888888888",
                  },
                  {
                    id: 4,
                    fullname: "Priya Singh",
                    email: "priya@gmail.com",
                    phone: "7777777777",
                  },
                  {
                    id: 5,
                    fullname: "Karan Mehta",
                    email: "karan@gmail.com",
                    phone: "6666666666",
                  },
                ].map((item) => (
                  <tr
                    key={item.id}
                    className="group transition-all duration-300 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5"
                  >
                    <td className="px-6 py-5 font-bold text-slate-800 dark:text-white">
                      {item.fullname}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {item.email}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canEditTask && (
                          <button
                            onClick={() => handleAssignTask(item.id)}
                            className="h-9 rounded-2xl bg-indigo-600 px-5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-200"
                          >
                            Assign
                          </button>
                        )}
                        {canViewTask && (
                          <button
                            onClick={() => handleAssignTask(item.id)}
                            className="h-9 rounded-2xl bg-slate-900 px-5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-slate-800 active:scale-95 shadow-lg shadow-slate-200"
                          >
                            View
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {canViewTask && !canEditTask && (
              <div className="p-5 bg-slate-50/50 border-t border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                👁️ Task Viewer Mode — No assign access
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default User_permission;
