import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Sidebar_Admin({ onAddUser }) {
  const [isOpen, setIsOpen] = useState(false);

  // collapse sidebar click only show icon
  const [collapse, setCollapse] = useState(false);
  const navigate = useNavigate();
  const navItems = [
    { label: "Dashboard", icon: "grid" },
    { label: "Analytics", icon: "chart-bar" },
    { label: "Task", icon: "megaphone" },
    { label: "Permission", icon: "users" },
    { label: "+ Add User", icon: "stack" },
    { label: "Logout", icon: "cloud" },
    { label: "chat", icon: "trending-up", badge: "NEW" },
    { label: "Access", icon: "wallet", badge: "NEW" },
    { label: "leave", icon: "robot", badge: "NEW" },
    { label: "E-commerce", icon: "shopping-bag" },
    { label: "Calendar", icon: "calendar" },
    { label: "User Profile", icon: "user" },
    { label: "Forms", icon: "document-text" },
    { label: "Tables", icon: "table" },
  ];

  const handleNavigation = (label) => {
    console.log("Navigating for label:", label); // Added for debugging
    if (label === "Analytics") {
      navigate("/User_Data_Adminpenal");
    }

    if (label === "Dashboard") {
      navigate("/deshbaord");
    }

    /*if (label === "CRM") {
      navigate("/register");
    }*/

    if (label === "Logout") {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      localStorage.removeItem("groupId");

      // RESET THEME
      document.documentElement.setAttribute("data-theme", "light");

      // REDIRECT + REFRESH
      window.location.href = "/login";

      return;
      //   navigate("/login");
    }

    if (label === "Task") {
      navigate("/Task_admin");
    }
    if (label === "chat") {
      navigate("/chat");
    }
    if (label === "leave") {
      navigate("/leaves");
    }

    /* if (label === "Permission") {
      navigate("/Permission");
    }*/
    /*if (label === "Access") {
      navigate("/Access_user_dashboard");
    }*/

    if (label === "+ Add User") {
      onAddUser();
      return;
    }
  };

  const renderIcon = (type) => {
    const baseClasses =
      "inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-slate-200";

    switch (type) {
      case "grid":
        return <span className={baseClasses}>▦</span>;
      case "chart-bar":
        return <span className={baseClasses}>📊</span>;
      case "megaphone":
        return <span className={baseClasses}>📣</span>;
      case "users":
        return <span className={baseClasses}>👥</span>;
      case "stack":
        return <span className={baseClasses}>📚</span>;
      case "cloud":
        return <span className={baseClasses}>☁️</span>;
      case "truck":
        return <span className={baseClasses}>🚚</span>;
      case "sparkles":
        return <span className={baseClasses}>✨</span>;
      case "trending-up":
        return <span className={baseClasses}>📈</span>;
      case "wallet":
        return <span className={baseClasses}>💼</span>;
      case "robot":
        return <span className={baseClasses}>🤖</span>;
      case "shopping-bag":
        return <span className={baseClasses}>🛍️</span>;
      case "calendar":
        return <span className={baseClasses}>📅</span>;
      case "user":
        return <span className={baseClasses}>👤</span>;
      case "check-circle":
        return <span className={baseClasses}>✅</span>;
      case "document-text":
        return <span className={baseClasses}>📝</span>;
      case "table":
        return <span className={baseClasses}>📋</span>;
      default:
        return <span className={baseClasses}>•</span>;
    }
  };

  const renderNavSection = (items) => (
    <div className="space-y-2 rounded-[2rem] bg-slate-900 p-4 text-slate-400 shadow-inner ring-1 ring-slate-800">
      {items.map((item) => (
        <div key={item.label} className="space-y-2">
          <button
            onClick={() => handleNavigation(item.label)}
            className={`flex w-full items-center justify-between gap-3 rounded-3xl px-4 py-3 text-left transition ${
              item.active
                ? "bg-slate-800 text-slate-100 shadow shadow-slate-900"
                : "hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-3">
              {renderIcon(item.icon)}
              <div>
                {!collapse && (
                  <p className="text-sm font-medium">{item.label}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {item.badge ? (
                <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-950">
                  {item.badge}
                </span>
              ) : null}
              {!collapse && item.active ? (
                <span className="text-slate-400">▾</span>
              ) : null}
            </div>
          </button>
          {item.subItems && item.subItems.length > 0 ? (
            <div className="space-y-2 rounded-3xl bg-slate-950 px-8 py-3">
              {item.subItems.map((subItem) => (
                <button
                  key={subItem}
                  className="flex w-full items-center rounded-3xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                >
                  {subItem}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );

  const renderSecondaryItems = () => (
    <div className="mt-6 space-y-2 rounded-[2rem] bg-slate-900 p-4 text-slate-400 shadow-inner ring-1 ring-slate-800">
      {navItems.slice(10).map((item) => (
        <button
          key={item.label}
          onClick={() => handleNavigation(item.label)}
          className="flex w-full items-center justify-between gap-3 rounded-3xl px-4 py-3 text-left transition hover:bg-slate-800"
        >
          <div className="flex items-center gap-3">
            {renderIcon(item.icon)}
            {!collapse && (
              <p className="text-sm font-medium text-slate-200">{item.label}</p>
            )}
          </div>
          {!collapse && item.badge ? (
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-950">
              {item.badge}
            </span>
          ) : null}
        </button>
      ))}
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

      <div className="md:hidden  fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-slate-950 px-4 py-3 text-slate-100 shadow-lg touch-pan-y">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-3xl bg-blue-600 text-lg font-semibold text-white">
            TA
          </div>
          {!collapse && (
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                TailAdmin
              </p>
              <p className="text-base font-semibold text-white">Menu</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-xl text-slate-200 ring-1 ring-slate-700 hover:bg-slate-800"
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-slate-950/80 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-full transform bg-slate-950 text-slate-200 shadow-xl transition duration-300 md:hidden overflow-y-auto no-scrollbar ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-3xl bg-blue-600 text-lg font-semibold text-white">
              TA
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                TailAdmin
              </p>
              <p className="text-base font-semibold text-white">Menu</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-xl text-slate-200 ring-1 ring-slate-700 hover:bg-slate-800"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {renderNavSection(navItems.slice(0, 10))}
        {renderSecondaryItems()}
      </aside>

      <aside
        className={`hidden md:block fixed top-0 left-0 h-screen bg-slate-950 text-slate-200 overflow-y-auto no-scrollbar touch-pan-y z-50 duration-300 ${
          collapse ? "w-24" : "w-[300px]"
        }`}
      >
        <div className="mb-10 flex items-center gap-3 px-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-600 text-xl font-semibold text-white">
            TA
          </div>
          {!collapse && (
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                TailAdmin
              </p>
              <p className="text-lg font-semibold text-white">Menu</p>
            </div>
          )}
          <button
            onClick={() => setCollapse(!collapse)}
            className="ml-auto rounded-xl bg-slate-800 px-3 py-2"
          >
            ☰
          </button>
        </div>

        {renderNavSection(navItems.slice(0, 10))}
        {renderSecondaryItems()}
      </aside>
    </>
  );
}

export default Sidebar_Admin;
