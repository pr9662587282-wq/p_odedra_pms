import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";

const navItems = [
  { label: "Dashboard", icon: "🏠", path: "/UserDeshboard" },
  { label: "Profile", icon: "👤", path: "/profile" },
  { label: "Leave", icon: "🗓️", path: "/leave" },
  { label: "Attendance", icon: "✅", path: "/attendance" },
  { label: "Tasks", icon: "📝", path: "/tasks" },
  { label: "chat", icon: "🗨️", path: "/chat" },
  { label: "Logout", icon: "🚪", path: "/login" },
  { label: "User_permission", icon: "🚪", path: "/User_permission" },
];

const profile = {
  status: "Active",
  team: "Product",
  projects: "Active",
};

export default function User_Sidebar({ fullName, profileImage }) {
  const email = localStorage.getItem("username") || "User Email";
  const initials = (fullName || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [collapse, setCollapse] = useState(false);

  // Connect to socket on every page where Sidebar is present to show "Online" status
  useEffect(() => {
    const rawId = localStorage.getItem("userId");
    if (!rawId || rawId === "null" || rawId === "undefined") {
      return;
    }

    const userId = String(rawId).replace(/["']/g, "").trim();

    const socket = io(import.meta.env.VITE_API_URL);
    socket.emit("join", userId);

    return () => {
      socket.disconnect();
    };
  }, [location.pathname]); // Re-evaluate whenever path changes

  const handleNav = (path) => {
    if (path === "/login") {
      setIsOpen(false);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      localStorage.removeItem("groupId");

      // theme reset
      document.documentElement.setAttribute("data-theme", "light");

      // pura app refresh
      window.location.href = "/login";
      return;
    }

    setIsOpen(false);
    navigate(path);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Profile header */}
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5">
        {profileImage ? (
          <img
            src={
              profileImage.startsWith("data:") ||
              profileImage.startsWith("http")
                ? profileImage
                : `data:image/png;base64,${profileImage}`
            }
            alt="profile"
            className="h-11 w-11 shrink-0 rounded-2xl object-cover shadow-lg"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-lg">
            {initials}
          </div>
        )}
        {!collapse && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {fullName || "User"}
            </p>

            {email && !email.endsWith("@otp.com") && (
              <p className="truncate text-xs text-slate-400">{email}</p>
            )}
          </div>
        )}
        {/* Close btn — mobile only */}
        <button
          onClick={() => setIsOpen(false)}
          className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 md:hidden"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      {/* Status card */}
      {!collapse && (
        <div className="mx-4 mt-4 rounded-2xl bg-slate-800/60 p-4 ring-1 ring-slate-700/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-widest">
              Status
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {profile.status}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-900 p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                Team
              </p>
              <p className="mt-0.5 text-sm font-semibold text-white">
                {profile.team}
              </p>
            </div>
            <div className="rounded-xl bg-slate-900 p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                Projects
              </p>
              <p className="mt-0.5 text-sm font-semibold text-white">
                {profile.projects}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Nav */}
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => handleNav(item.path)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all ${
                active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ${active ? "bg-indigo-500" : "bg-slate-800"}`}
              >
                {item.icon}
              </span>
              {!collapse && <p>{item.label}</p>}
            </button>
          );
        })}
      </nav>

      {/* Quick stats */}
      {!collapse && (
        <div className="mx-4 mb-5 mt-4 rounded-2xl bg-slate-800/60 p-4 ring-1 ring-slate-700/50">
          <p className="mb-3 text-[10px] uppercase tracking-widest text-slate-500">
            Quick Info
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-2.5 text-sm">
              <span className="text-slate-400">Attendance</span>
              <span className="font-semibold text-emerald-400">97%</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-2.5 text-sm">
              <span className="text-slate-400">Pending Leave</span>
              <span className="font-semibold text-amber-400">1</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>

      {/* ── Mobile top bar ── */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-slate-950 px-4 py-3 shadow-lg md:hidden">
        <div className="flex items-center gap-3">
          {profileImage ? (
            <img
              src={
                profileImage.startsWith("data:") ||
                profileImage.startsWith("http")
                  ? profileImage
                  : `data:image/png;base64,${profileImage}`
              }
              alt="profile"
              className="h-9 w-9 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
              {initials}
            </div>
          )}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">
              User Panel
            </p>
            <p className="text-sm font-semibold text-white">
              {fullName || "User"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-200 ring-1 ring-slate-700"
          aria-label="Open menu"
        >
          ☰
        </button>
      </header>

      {/* ── Mobile overlay ── */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* ── Sidebar (mobile: drawer, desktop: fixed) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto no-scrollbar bg-slate-950 text-slate-100 shadow-2xl transition-all duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapse ? "md:w-20" : "md:w-72"}`}
      >
        <div className="flex p-4">
          <button
            onClick={() => setCollapse(!collapse)}
            className={`rounded-xl bg-slate-800 px-3 py-2 transition-all ${
              collapse ? "mx-auto" : "ml-auto"
            }`}
          >
            ☰
          </button>
        </div>

        <SidebarContent />
      </aside>
    </>
  );
}
