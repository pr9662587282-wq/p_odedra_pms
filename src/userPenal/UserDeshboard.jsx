import { useState, useEffect } from "react";
import axios from "axios";
import User_Sidebar from "./User_Sidebar";
import { Calendar } from "@/components/ui/calendar";
// theme change mian file
import { useTheme } from "../Theme/ThemeContext";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Sidebar_Admin from "../admin_penal/Sidebar_Admin";

////
import logo from "../assets/photo-1624770802806-5df97af960b6.png";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
/////
// Token + config
const getToken = () => localStorage.getItem("token");
const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

// Live clock
function useLiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// Format time → "10:09 AM"
function fmtTime(d) {
  if (!d) return null;
  return new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Format date → "19-05-2026"
function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Stat card
function StatCard({ label, value, color }) {
  const c = {
    blue: "from-blue-500 to-indigo-600",
    green: "from-emerald-500 to-teal-600",
    amber: "from-amber-400 to-orange-500",
    rose: "from-rose-500 to-pink-600",
  };
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${c[color]} p-5 text-white shadow-lg`}
    >
      <p className="text-xs font-medium uppercase tracking-widest opacity-80">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

const holidays = [{ name: "Makar Sankranti", date: "14-01-2026" }];

function formatUpcomingBdayDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────
function formatShiftBanner(shift) {
  if (!shift?.windowStart || !shift?.windowEnd) return "";
  const opt = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  const s = new Date(shift.windowStart).toLocaleString("en-IN", opt);
  const e = new Date(shift.windowEnd).toLocaleString("en-IN", opt);
  return `${s} → ${e} (local time)`;
}

export default function UserDeshboard() {
  const { id } = useParams();
  const location = useLocation();
  const fromAdmin = location.state?.fromAdmin;
  const adminViewedFullName = location.state?.adminViewedFullName;

  const userId = id || localStorage.getItem("userId");
  const [calDate, setCalDate] = useState(new Date());
  const [record, setRecord] = useState(null); // current 9 AM–9 AM shift record
  const [shift, setShift] = useState(null); // window from API
  const [loading, setLoading] = useState("");
  const [msg, setMsg] = useState("");
  const now = useLiveClock();

  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";
  const isUser = role === "user";

  const isAdminView = fromAdmin === true;
  //  upcoming bday
  const [Upcomingbirthdays, setUpcomingbirthdays] = useState([]);

  const totalHours = 8.5;

  let workedHours = 0;

  if (record?.checkIn && record?.checkOut) {
    const inTime = new Date(record.checkIn);
    const outTime = new Date(record.checkOut);

    const totalWorked = (outTime - inTime) / 3600000;

    let breakHours = 0;

    if (record?.breakIn && record?.breakOut) {
      const breakIn = new Date(record.breakIn);
      const breakOut = new Date(record.breakOut);

      breakHours = (breakOut - breakIn) / 3600000;
    }

    workedHours = totalWorked - breakHours;
  }

  const attendancePercent = Math.round((workedHours / totalHours) * 100);
  // Current 9 AM → next day 9 AM shift from DB
  const fetchToday = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/attendance/today/${id}`,
        getConfig(),
      );
      setRecord(res.data.record);
      setShift(res.data.shift ?? null);
    } catch (err) {
      console.log(err);
    }
  };

  // upcoming bday api call
  const fetchBirthdays = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/UpcomingBday",
        getConfig(),
      );
      const list = Array.isArray(res.data)
        ? res.data
        : (res.data?.birthdays ?? []);
      setUpcomingbirthdays(list);
    } catch (err) {
      console.log(
        "Upcoming birthdays:",
        err.response?.data?.message || err.message,
      );
      setUpcomingbirthdays([]);
    }
  };

  useEffect(() => {
    fetchToday();
    fetchBirthdays();
  }, [id]);

  // Refetch every minute so when the clock crosses 9 AM the new shift shows without reload
  useEffect(() => {
    const id = setInterval(() => {
      fetchToday();
    }, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // CHECK IN — once per shift (9 AM–next 9 AM)
  const checkIn = async () => {
    try {
      setLoading("checkin");
      const res = await axios.post(
        "http://localhost:5000/attendance/checkin",
        {},
        getConfig(),
      );
      setRecord(res.data.data);
      setMsg("✅ " + res.data.message);
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.message || "Error"));
    } finally {
      setLoading("");
    }
  };

  // CHECK OUT — once per shift
  const checkOut = async () => {
    try {
      setLoading("checkout");
      const res = await axios.post(
        "http://localhost:5000/attendance/checkout",
        {},
        getConfig(),
      );
      setRecord(res.data.data);
      setMsg("✅ " + res.data.message);
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.message || "Error"));
    } finally {
      setLoading("");
    }
  };

  // BREAK IN — multiple times allowed
  const breakIn = async () => {
    try {
      setLoading("breakin");
      const res = await axios.post(
        "http://localhost:5000/attendance/breakin",
        {},
        getConfig(),
      );
      setRecord(res.data.data);
      setMsg("✅ " + res.data.message);
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.message || "Error"));
    } finally {
      setLoading("");
    }
  };

  // BREAK OUT — closes current open break
  const breakOut = async () => {
    try {
      setLoading("breakout");
      const res = await axios.post(
        "http://localhost:5000/attendance/breakout",
        {},
        getConfig(),
      );
      setRecord(res.data.data);
      setMsg("✅ " + res.data.message);
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.message || "Error"));
    } finally {
      setLoading("");
    }
  };

  // Build log rows from record
  // Check In = 1 row, Check Out = 1 row, Breaks = dynamic (each break = 2 rows)
  function buildLogs() {
    const rows = [];

    // Check In row
    rows.push({
      label: "Check In",
      dateStr: record?.checkIn,
      color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    });

    // Break rows — loop through breaks array
    const breaks = record?.breaks || [];
    if (breaks.length === 0) {
      // No breaks yet — show empty placeholders
      rows.push({
        label: "Break In",
        dateStr: null,
        color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      });
      rows.push({
        label: "Break Out",
        dateStr: null,
        color: "bg-blue-500/20  text-blue-400  border-blue-500/30",
      });
    } else {
      breaks.forEach((b, i) => {
        // If multiple breaks, show number: "Break In 1", "Break In 2"
        const num = breaks.length > 1 ? ` ${i + 1}` : "";
        rows.push({
          label: `Break In${num}`,
          dateStr: b.breakIn,
          color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        });
        rows.push({
          label: `Break Out${num}`,
          dateStr: b.breakOut,
          color: "bg-blue-500/20  text-blue-400  border-blue-500/30",
        });
      });
    }

    // Check Out row
    rows.push({
      label: "Check Out",
      dateStr: record?.checkOut,
      color: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    });

    return rows;
  }

  const logs = buildLogs();
  const { theme, toggleTheme } = useTheme();
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const fetchName = async () => {
      // 1. Priority: If Admin navigated here, use the name from state immediately for speed
      if (fromAdmin && adminViewedFullName) {
        setFullName(adminViewedFullName);
      }

      try {
        const url =
          id && id !== "undefined"
            ? `http://localhost:5000/profile/${id}`
            : "http://localhost:5000/get-username";

        const res = await axios.get(url, getConfig());

        // prioritized check for name from both /profile/:id and /get-username APIs
        const profileData = res.data.profile || {};
        const name =
          res.data.name ||
          profileData.fullName ||
          profileData.fullname ||
          "User";

        setFullName(name);
      } catch (err) {
        console.error("Error fetching dashboard name:", err);
        // Only fallback to "User" if we don't already have a name from state
        if (!fullName) setFullName("User");
      }
    };
    fetchName();
  }, [id, fromAdmin, adminViewedFullName]);

  const handleAttendanceAction = (action) => {
    if (isAdminView) {
      setMsg("❌ Admin view only. Attendance cannot be modified.");
      return;
    }

    action();
  };

  return (
    <div className=" card flex min-h-screen ">
      {isUser && <User_Sidebar fullName={fullName} />}
      {isAdmin && <Sidebar_Admin />}
      <main className="flex-1 md:ml-72 relative md:bottom-14 bottom-16">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline border-none"
              className="gap-2 relative md:top-[86px] w-fit top-[166px] left-[340px] md:left-[1290px] flex z-50"
            >
              {" "}
              <img
                src={logo}
                alt="profile"
                className=" h-10 w-10 rounded-full object-cover"
              />{" "}
              <span className="text-sm hidden md:block ">
                <h1> {fullName}</h1>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className=" card w-56 h-64  relative md:top-[30px] md:right-6">
            <DropdownMenuLabel className="flex items-center gap-2  ">
              <Avatar>
                <AvatarImage
                  src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
                  alt="Phillip George"
                />
                <AvatarFallback className="text-xs">PG</AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col">
                <span className="text-popover-foreground">{fullName}</span>
                <span className="text-muted-foreground text-xs space-y-4">
                  {localStorage.getItem("username") || "No Email"}
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <hr></hr>
            <DropdownMenuGroup className="space-y-4 ">
              <DropdownMenuItem>📝 Edit Profile</DropdownMenuItem>
              <DropdownMenuItem>⚙️ Account settings </DropdownMenuItem>
              <DropdownMenuItem>🛠️ support</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>More...</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <hr></hr>

              <DropdownMenuItem> ⇦log out</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          onClick={toggleTheme}
          className="flex relative top-32 left-72 z-50 h-11 w-11  items-center justify-center rounded-full bg-slate-200 text-lg transition hover:bg-slate-300 md:absolute md:top-20 md:left-[1240px] "
        >
          🌙
        </button>
        <div className="px-4 pb-10 pt-20 md:px-8 md:pt-8">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
              {now.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Attendance"
              value={`${attendancePercent || 0}%`}
              color="green"
            />
            <StatCard label="Tasks Done" value="12 / 15" color="blue" />
            <StatCard label="Pending Leave" value="1" color="amber" />
            <StatCard label="Late Days" value="2" color="rose" />
          </div>

          {/* Attendance grid */}
          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            {/* Today's log */}
            <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Current shift attendance
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Slot: 9:00 AM today → 9:00 AM tomorrow (each new slot starts
                    fresh after Check In).
                  </p>
                  {shift && (
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {formatShiftBanner(shift)}
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                  {now.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>

              {/* Message */}
              {msg && (
                <div className="mb-3 rounded-xl bg-slate-800 px-4 py-2 text-sm text-slate-200">
                  {msg}
                </div>
              )}

              {/* Log rows */}
              <div className="space-y-2">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between rounded-xl border px-4 py-2.5 ${log.color}`}
                  >
                    {/* Label */}
                    <span className="text-sm font-semibold min-w-[90px]">
                      {log.label}
                    </span>
                    {/* Time | Date */}
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-sm font-bold">
                        {fmtTime(log.dateStr) ?? "--:--"}
                      </span>
                      <span className="opacity-40 text-xs">|</span>
                      <span className="text-xs opacity-80">
                        {fmtDate(log.dateStr) ?? "--/--/----"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
              <h2 className="mb-5 text-lg font-semibold">Record Attendance</h2>
              <div className="grid grid-cols-2 gap-3">
                {/* Check In — disabled after first click */}
                <button
                  onClick={() => handleAttendanceAction(checkIn)}
                  disabled={loading === "checkin" || !!record?.checkIn}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-5 text-sm font-semibold shadow-lg transition hover:bg-emerald-500 active:scale-95 disabled:opacity-40"
                >
                  <span className="text-2xl">✅</span>
                  {loading === "checkin" ? "..." : "Check In"}
                </button>

                {/* Break In */}
                <button
                  onClick={() => handleAttendanceAction(breakIn)}
                  disabled={loading === "breakin" || !record?.checkIn}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-amber-500 py-5 text-sm font-semibold shadow-lg transition hover:bg-amber-400 active:scale-95 disabled:opacity-40"
                >
                  <span className="text-2xl">☕</span>
                  {loading === "breakin" ? "..." : "Break In"}
                </button>

                {/* Check Out — disabled after first click */}
                <button
                  onClick={() => handleAttendanceAction(checkOut)}
                  disabled={
                    loading === "checkout" ||
                    !record?.checkIn ||
                    !!record?.checkOut
                  }
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-rose-600 py-5 text-sm font-semibold shadow-lg transition hover:bg-rose-500 active:scale-95 disabled:opacity-40"
                >
                  <span className="text-2xl">🚪</span>
                  {loading === "checkout" ? "..." : "Check Out"}
                </button>

                {/* Break Out */}
                <button
                  onClick={() => handleAttendanceAction(breakOut)}
                  disabled={loading === "breakout" || !record?.checkIn}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-blue-600 py-5 text-sm font-semibold shadow-lg transition hover:bg-blue-500 active:scale-95 disabled:opacity-40"
                >
                  <span className="text-2xl">🔄</span>
                  {loading === "breakout" ? "..." : "Break Out"}
                </button>
              </div>

              {/* Break count info */}
              {record?.breaks?.length > 0 && (
                <p className="mt-4 text-center text-xs text-slate-400">
                  {record.breaks.length} break
                  {record.breaks.length > 1 ? "s" : ""} in this shift
                </p>
              )}
            </div>
          </div>

          {/* Calendar + Birthdays + Holidays */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className=" card rounded-2xl p-5 shadow-lg lg:col-span-1">
              <h2 className="mb-4 text-base font-semibold ">Calendar</h2>
              <Calendar
                mode="single"
                defaultMonth={calDate}
                selected={calDate}
                onSelect={(d) => d && setCalDate(d)}
                className="w-full"
              />
            </div>

            <div className=" card rounded-2xl p-5 shadow-lg">
              <h2 className="mb-1 text-base font-semibold ">
                🎂 Upcoming Birthdays
              </h2>
              <p className="mb-4 text-xs text-slate-400">
                {now.toLocaleString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}{" "}
                only
              </p>

              <div className="max-h-72 space-y-3 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-100">
                {Upcomingbirthdays.length === 0 && (
                  <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
                    No upcoming birthdays this month
                  </p>
                )}
                {Upcomingbirthdays.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100 text-lg">
                        🎉
                      </div>

                      <div>
                        <span className="text-sm font-medium text-slate-700">
                          {b.name || b.fullname}
                        </span>
                        {b.daysUntil === 0 ? (
                          <p className="text-xs font-semibold text-pink-500">
                            Today 🎂
                          </p>
                        ) : b.daysUntil != null ? (
                          <p className="text-xs text-slate-400">
                            in {b.daysUntil} day{b.daysUntil === 1 ? "" : "s"}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <span className="text-xs font-medium text-slate-400">
                      {formatUpcomingBdayDate(
                        b.nextBirthday || b.dob || b.bDate,
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className=" card rounded-2xl p-5 shadow-lg">
              <h2 className="mb-4 text-base font-semibold">🏖️ Holidays</h2>
              <div className="space-y-3">
                {holidays.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-lg">
                        📅
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {h.name}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      {h.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
