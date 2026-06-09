import React, { useEffect, useState } from "react";
import Sidebar_Admin from "./Sidebar_Admin";
import axios from "axios";
import { useTheme } from "../Theme/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function User_Data_Adminpenal() {
  const { theme } = useTheme();
  const [data, setData] = useState([]);
  const [openAnalytics, setOpenAnalytics] = useState(null);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const navigate = useNavigate();

  // permsion are apply code.......
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
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handlePermissionChange = (moduleName, permissionName, checked) => {
    setPermissions({
      ...permissions,
      [moduleName]: {
        ...permissions[moduleName],
        [permissionName]: checked,
      },
    });
  };
  const openPermissionPopup = async (item) => {
    try {
      const token = localStorage.getItem("token");

      const userId = item.userId?._id || item.userId || item._id;

      const res = await axios.get(
        `http://localhost:5000/permissions/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSelectedUser({
        id: userId,
        name: item.fullName || item.personalEmail || "User",
      });

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

      setShowPermissionPopup(true);
    } catch (error) {
      console.log(error);
      alert("Permission load failed");
    }
  };

  const savePermission = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/permissions/${selectedUser.id}`,
        { permissions },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Permissions updated successfully");
      setShowPermissionPopup(false);
      setSelectedUser(null);
    } catch (error) {
      console.log(error);
      alert("Permission update failed");
    }
  };
  ///////////////////////////////
  const ShowData = () => {
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
      .catch((err) => {
        console.log(err.response?.data || err.message);
      });
  };

  useEffect(() => {
    ShowData();
  }, []);

  return (
    <div
      className={`min-h-screen pt-20 md:pt-0 ${
        theme === "dark" ? " text-white" : "bg-slate-100 text-black"
      }`}
    >
      <Sidebar_Admin />

      {showPermissionPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Update Permissions
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedUser?.name}
                </p>
              </div>

              <button
                onClick={() => setShowPermissionPopup(false)}
                className="rounded-lg px-3 py-1 text-sm bg-slate-100 text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-4 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                <span>Module</span>
                <span className="text-center">Viewer</span>
                <span className="text-center">Editor</span>
                <span className="text-center">Delete</span>
              </div>

              <div className="grid grid-cols-4 items-center px-4 py-3 text-sm border-t">
                <span>Profile</span>
                <input type="checkbox" checked disabled className="mx-auto" />
                <input
                  type="checkbox"
                  checked={permissions.profile.editor}
                  onChange={(e) =>
                    handlePermissionChange(
                      "profile",
                      "editor",
                      e.target.checked,
                    )
                  }
                  className="mx-auto"
                />
                <input
                  type="checkbox"
                  checked={permissions.profile.deletePermission}
                  onChange={(e) =>
                    handlePermissionChange(
                      "profile",
                      "deletePermission",
                      e.target.checked,
                    )
                  }
                  className="mx-auto"
                />
              </div>

              <div className="grid grid-cols-4 items-center px-4 py-3 text-sm border-t">
                <span>Attendance</span>
                <input
                  type="checkbox"
                  checked={permissions.attendance.viewer}
                  onChange={(e) =>
                    handlePermissionChange(
                      "attendance",
                      "viewer",
                      e.target.checked,
                    )
                  }
                  className="mx-auto"
                />
                <input
                  type="checkbox"
                  checked={permissions.attendance.editor}
                  onChange={(e) =>
                    handlePermissionChange(
                      "attendance",
                      "editor",
                      e.target.checked,
                    )
                  }
                  className="mx-auto"
                />
                <span className="text-center text-slate-400">-</span>
              </div>

              <div className="grid grid-cols-4 items-center px-4 py-3 text-sm border-t">
                <span>Task</span>
                <input
                  type="checkbox"
                  checked={permissions.task.viewer}
                  onChange={(e) =>
                    handlePermissionChange("task", "viewer", e.target.checked)
                  }
                  className="mx-auto"
                />
                <input
                  type="checkbox"
                  checked={permissions.task.editor}
                  onChange={(e) =>
                    handlePermissionChange("task", "editor", e.target.checked)
                  }
                  className="mx-auto"
                />
                <span className="text-center text-slate-400">-</span>
              </div>
            </div>

            <button
              onClick={savePermission}
              className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Apply / Update Permission
            </button>
          </div>
        </div>
      )}

      <div className="md:ml-80">
        <div className="mx-4 rounded-[1.5rem] bg-white dark:bg-slate-900 p-4 shadow-sm ring-1 ring-slate-200 mb-6 md:mx-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                User Directory
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                Manage users
              </h1>
            </div>
            <div className="w-full sm:w-auto">
              <input
                id="search-input"
                type="text"
                placeholder="Search or type command..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/5 focus:outline-none dark:bg-slate-800 dark:border-slate-700 sm:w-72"
              />
            </div>
          </div>
        </div>

        <div className="mx-4 overflow-x-auto rounded-[2rem] border border-slate-200/60 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none md:mx-6 mt-2">
          <table className="w-full min-w-[1000px] border-collapse text-left text-[15px]">
            <thead className="bg-slate-50/50 text-[13px] font-black uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                  User
                </th>
                <th className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                  Address
                </th>
                <th className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                  Email
                </th>
                <th className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                  Role
                </th>
                <th className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                  Contact
                </th>
                <th className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                  Joining
                </th>
                <th className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.map((item, index) => (
                <tr
                  key={item._id || index}
                  className="transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          className="h-11 w-11 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                          src={
                            item.profileImage
                              ? `data:image/png;base64,${item.profileImage}`
                              : `https://i.pravatar.cc/100?img=${index}`
                          }
                          alt="User avatar"
                        />
                        <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900"></span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-black text-slate-800 dark:text-white">
                          {item.fullName || item.fullname || "User"}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {item.gender}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm font-black text-slate-600 dark:text-slate-400">
                      {item.address}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-black text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                      {item.personalEmail}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                        {item.designation}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {new Date(item.birthday).toLocaleDateString()} (B'day)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="font-mono text-sm font-black text-slate-600 dark:text-slate-400">
                      {item.phone}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm font-black text-slate-500">
                      {new Date(item.joiningDate).toLocaleDateString()}
                    </span>
                  </td>

                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {/* Permission */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-xl border-slate-200 bg-white text-[10px] font-bold uppercase tracking-tight text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                        onClick={() => openPermissionPopup(item)}
                      >
                        Permission 🔒
                      </Button>

                      {/* Analytics Button Logic */}
                      <div className="relative">
                        {openAnalytics === item._id && (
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenAnalytics(null)}
                          />
                        )}
                        <button
                          onClick={() =>
                            setOpenAnalytics(
                              openAnalytics === item._id ? null : item._id,
                            )
                          }
                          className="relative z-20 inline-flex items-center gap-1 rounded-lg  bg-gradient-to-r bg-purple-400 px-2 py-1 text-xs font-semibold text-purple-700 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-purple-300"
                        >
                          <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                          Analytics
                        </button>
                        {/* dropdown */}
                        {openAnalytics === item._id && (
                          <div className="absolute right-0 top-14 z-30 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                            {/* header */}
                            <div className="border-b bg-slate-50 px-4 py-3 text-left">
                              <h3 className="text-sm font-semibold text-slate-800">
                                User Analytics
                              </h3>
                              <p className="text-xs text-slate-500">
                                Open dashboard modules
                              </p>
                            </div>

                            {/* dashboard */}
                            <button
                              onClick={() => {
                                const targetId =
                                  item.userId?._id || item.userId || item._id;
                                navigate(`/UserDeshboard/${targetId}`, {
                                  state: {
                                    fromAdmin: true,
                                    adminViewedFullName:
                                      item.fullName || item.fullname,
                                  },
                                });
                                setOpenAnalytics(null);
                              }}
                              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-violet-50"
                            >
                              <span>Dashboard</span>
                              <span className="text-violet-500">→</span>
                            </button>

                            {/* attendance */}
                            <button
                              onClick={() => {
                                const targetId =
                                  item.userId?._id || item.userId || item._id;

                                navigate(`/attendance/${targetId}`, {
                                  state: {
                                    fromAdmin: true,
                                    adminViewedFullName:
                                      item.fullName || item.fullname,
                                  },
                                });

                                setOpenAnalytics(null);
                              }}
                              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-blue-50"
                            >
                              <span>Attendance</span>{" "}
                              <span className="text-blue-500">→</span>
                            </button>

                            {/* task */}
                            <button
                              onClick={() => {
                                const targetId =
                                  item.userId?._id || item.userId || item._id;

                                navigate(`/tasks/${targetId}`, {
                                  state: {
                                    fromAdmin: true,
                                    adminViewedFullName:
                                      item.fullName || item.fullname,
                                  },
                                });

                                setOpenAnalytics(null);
                              }}
                              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-emerald-50"
                            >
                              <span>Task</span>{" "}
                              <span className="text-emerald-500">→</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800"></div>

                      {/* Edit */}
                      <button
                        onClick={() => {
                          const targetId =
                            item.userId?._id || item.userId || item._id;

                          navigate(`/profile/${targetId}`, {
                            state: {
                              fromAdmin: true,
                              adminViewedFullName:
                                item.fullName || item.fullname,
                            },
                          });
                        }}
                        className="
    rounded-lg
    bg-blue-700
    px-4 py-2
    text-xs font-medium text-white
    shadow-sm
    hover:bg-blue-600
    transition-all duration-200
    active:scale-95
  "
                        title="Edit User"
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

                      {/* Delete */}
                      <button
                        className="
    rounded-lg
    bg-red-700
    px-4 py-2
    text-xs font-medium text-white
    shadow-sm
    hover:bg-red-600
    transition-all duration-200
    active:scale-95
  "
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <span className="text-4xl mb-4">📂</span>
              <p className="font-bold uppercase tracking-widest text-xs">
                No users found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default User_Data_Adminpenal;
