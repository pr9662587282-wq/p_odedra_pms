import React, { useState, useEffect } from "react";
import Sidebar_Admin from "./Sidebar_Admin";
import { useTheme } from '../../context/ThemeContext';
import Register from '../auth/Register';
import logo from '../../assets/photo-1624770802806-5df97af960b6.png';
import axios from "axios";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
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

const salesBars = [18, 40, 24, 34, 22, 28, 42, 18, 26, 44, 30, 20];
const salesLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

import { io } from "socket.io-client";
import { useRef } from "react";

function CalendarWidget({ leaves = [] }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date());

  const [openDay, setOpenDay] = useState(null); // which day's dropdown is open

  // ── Helper: get all leave records that fall on a given day ──
  // ⚠️ Adjust field names below (fromDate/toDate/name/status) to match
  // your actual leave object shape from /leave/admin/all
  const getLeavesForDay = (day, month, year) => {
    if (!day) return [];
    const cellDate = new Date(year, month, day);
    cellDate.setHours(0, 0, 0, 0);

    return leaves.filter((lv) => {
      // ── Accept many possible status field spellings/casings ──
      const statusVal = (lv.status || lv.leaveStatus || "")
        .toString()
        .toLowerCase();
      if (
        statusVal &&
        !["approved", "accepted", "confirmed"].includes(statusVal)
      ) {
        return false;
      }

      // ── Try every likely date field name ──
      const rawFrom =
        lv.fromDate ||
        lv.startDate ||
        lv.leaveFrom ||
        lv.from ||
        lv.date ||
        lv.leaveDate;
      const rawTo =
        lv.toDate ||
        lv.endDate ||
        lv.leaveTo ||
        lv.to ||
        lv.date ||
        lv.leaveDate ||
        rawFrom;

      if (!rawFrom) return false;

      // ── Parse both "DD-MM-YYYY" and ISO formats ──
      const parseDateStr = (str) => {
        if (!str) return null;
        if (typeof str === "string" && /^\d{2}-\d{2}-\d{4}$/.test(str)) {
          const [dd, mm, yyyy] = str.split("-");
          return new Date(`${yyyy}-${mm}-${dd}`);
        }
        return new Date(str);
      };

      const from = parseDateStr(rawFrom);
      const to = parseDateStr(rawTo);
      if (!from || !to) return false;
      from.setHours(0, 0, 0, 0);
      to.setHours(0, 0, 0, 0);

      if (isNaN(from) || isNaN(to)) return false;

      return cellDate >= from && cellDate <= to;
    });
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const goPrev = () => setViewDate(new Date(year, month - 1, 1));
  const goNext = () => setViewDate(new Date(year, month + 1, 1));

  const isToday = (d) =>
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-lg">
            📅
          </span>
          <div>
            <p className="text-xs font-medium text-slate-400">Calendar</p>
            <h3 className="text-base font-semibold">
              {monthNames[month]} {year}
            </h3>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={goPrev}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-lg"
          >
            ‹
          </button>
          <button
            onClick={goNext}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-lg"
          >
            ›
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {dayNames.map((d) => (
          <p key={d} className="text-xs font-semibold text-slate-400 pb-1">
            {d}
          </p>
        ))}
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} />;

          const dayLeaves = getLeavesForDay(day, month, year);
          const isOpen = openDay === day;

          return (
            <div key={day} className="relative">
              <button
                type="button"
                onClick={() =>
                  dayLeaves.length > 0 && setOpenDay(isOpen ? null : day)
                }
                className={`mx-auto flex h-8 w-8 flex-col items-center justify-center rounded-full text-sm font-medium transition ${
                  dayLeaves.length > 0 ? "cursor-pointer" : "cursor-default"
                } ${
                  isToday(day)
                    ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-200"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {day}
              </button>

              {dayLeaves.length > 0 && (
                <span
                  onClick={() => setOpenDay(isOpen ? null : day)}
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-sm cursor-pointer"
                >
                  {dayLeaves.length}
                </span>
              )}

              {isOpen && dayLeaves.length > 0 && (
                <div className="absolute z-50 top-10 left-1/2 -translate-x-1/2 w-48 rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 p-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                    On Leave
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {dayLeaves.map((lv, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-xl bg-rose-50 px-2 py-1.5"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-600 shrink-0">
                          {(lv.fullName || lv.employeeName || lv.name || lv.email || "U").charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-700 truncate">
                            {lv.fullName || lv.employeeName || lv.name || "—"}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {lv.email || lv.employeeEmail || "—"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Dashboard({ onAddUser }) {
  const { theme, toggleTheme } = useTheme();
  const [openRegister, setOpenRegister] = useState(false);
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [stats, setStats] = useState({
    monthlyRate: 0,
    present: 0,
    absent: 0,
    onLeave: 0,
  });

  useEffect(() => {
    const fetchRate = async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/attendance/monthly-rate?month=2026-06`,
        { headers: getHeaders() },
      );
      setAttendanceRate(res.data.monthlyRate);
      setStats(res.data);
    };
    fetchRate();
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchDashboard = async () => {
    try {
      const [usersRes, leavesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/user-names`, {
          headers: getHeaders(),
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/leave/admin/all`, {
          headers: getHeaders(),
        }),
      ]);
      setUsers(usersRes.data);
      setLeaves(leavesRes.data);
      console.log("LEAVES DATA:", leavesRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  const totalEmployees = users.length;
  const activeEmployees = users.filter((user) =>
    onlineUsers.includes(String(user._id)),
  ).length;
  const totalLeaveRequests = leaves.length;
  const pendingRequests = leaves.filter(
    (leave) => leave.status === "Pending",
  ).length;

  useEffect(() => {
    const myId = localStorage.getItem("userId");
    if (!myId) return;
    socketRef.current = io(import.meta.env.VITE_API_URL);
    socketRef.current.emit("join", myId);
    socketRef.current.on("online_users", (ids) => {
      if (Array.isArray(ids)) setOnlineUsers(ids.map(String));
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <div
      className={`min-h-screen px-3 pb-8 pt-20 md:ml-80 md:px-6 md:pt-0 ${
        theme === "dark" ? " text-white" : "bg-slate-100 text-black"
      }`}
    >
      <Sidebar_Admin onAddUser={() => setOpenRegister(true)} />

      {/* Register popup */}
      {openRegister && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenRegister(false)}
          />
          <div className="relative z-10 w-full max-w-sm shadow-2xl rounded-2xl overflow-hidden">
            <Register isModal={true} onClose={() => setOpenRegister(false)} />
          </div>
        </div>
      )}

      {/* Header */}
      <div className=" card mx-auto mb-6 w-full p-4 border-none md:relative md:top-[1px] md:mb-6 md:h-[78px] md:w-[920px] md:p-1 md:ml-[650px]">
        <p className="text-sm font-medium ">.</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl relative md:bottom-[10px]">
          Welcome back, prakash
        </h1>
        <div className="mt-4 flex justify-end gap-3 md:-mt-10 lg:flex lg:items-center lg:justify-between">
          <div className="flex gap-8 md:relative md:bottom-[8px] lg:ml-auto md:right-[50px]">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-lg transition hover:bg-slate-300"
            >
              🌙
            </button>
            <button
              type="button"
              onClick={() => setOpenRegister(true)}
              title="Add New User"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-400 hover:bg-amber-500 text-slate-900 transition shadow-md shadow-amber-100 dark:shadow-none border border-amber-300"
            >
              <UserPlus className="h-5 w-5 stroke-[2.5]" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline border-none"
                  className="gap-4 relative md:top-1 top-1"
                >
                  <img
                    src={logo}
                    alt="profile"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  User Profile
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className=" card w-56 h-64 relative md:top-[30px] md:right-6">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage
                      src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
                      alt="Phillip George"
                    />
                    <AvatarFallback className="text-xs">PG</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col">
                    <span className="text-popover-foreground">
                      Phillip George
                    </span>
                    <span className="text-muted-foreground text-xs space-y-4">
                      phillip@example.com
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <hr />
                <DropdownMenuGroup className="space-y-4">
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
                  <hr />
                  <DropdownMenuItem> ⇦log out</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className=" card relative hidden w-full border-none p-2 md:block md:right-[685px] md:bottom-[68px] md:h-[78px] md:w-[682px]">
          <input
            id="search-input"
            type="text"
            placeholder="Search or type command..."
            className="relative h-11 w-full rounded-lg border md:left-16 border-gray-300 bg-transparent px-4 pr-14 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-brand-500/10 md:top-2 md:w-96"
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* ── Row 1: Top 2 stat boxes (left) + Attendance Rate donut (right) ── */}
        <div className="grid w-full gap-12 xl:grid-cols-[1.45fr_1fr]">
          <div className="mx-auto grid w-full gap-4 sm:grid-cols-2 sm:gap-6 md:h-[200px]">
            <div className="card w-full rounded-[1.5rem] p-5 shadow-sm ring-1 sm:p-6">
              <p className="text-sm font-medium ">Total Employees</p>
              <div className="mt-4 flex items-center justify-between gap-4 sm:mt-6">
                <div>
                  <p className="text-3xl font-semibold sm:text-4xl">
                    {totalEmployees}
                  </p>
                  <p className="mt-2 text-sm">
                    Active employees:{activeEmployees}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  +11.01%
                </span>
              </div>
            </div>

            <div className=" card w-full rounded-[1.5rem] p-5 shadow-sm ring-1 sm:p-6">
              <p className="text-sm font-medium ">Pending requests</p>
              <div className="mt-4 flex items-center justify-between gap-4 sm:mt-6">
                <div>
                  <p className="text-3xl font-semibold sm:text-4xl">
                    {totalLeaveRequests}
                  </p>
                  <p className="mt-2 text-sm ">
                    {" "}
                    Pending Requests: {pendingRequests}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                  -9.05%
                </span>
              </div>
            </div>
          </div>

          <div className=" card mx-auto w-full rounded-[2rem] p-5 shadow-sm ring-1 sm:p-8 md:h-[600px]">
            <div className=" flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div>
                <p className="text-sm font-medium">Attendance Rate</p>
                <h2 className="mt-2 text-lg font-semibold tracking-tight sm:mt-3 sm:text-2xl">
                  Employee attendance this month
                </h2>
              </div>
              <button
                type="button"
                className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                •••
              </button>
            </div>

            <div className="mt-6 flex justify-center sm:mt-9">
              <div className="relative h-56 w-full max-w-xs sm:h-64 sm:max-w-sm">
                <div className="absolute inset-x-0 bottom-0 h-28 overflow-hidden sm:h-36">
                  <div className="mx-auto h-[120px] w-[220px] rounded-full border-8 border-slate-200 border-t-blue-500 sm:h-[150px] sm:w-[300px]" />
                </div>
                <div className=" relative inset-x-0 top-20 flex justify-center sm:top-16">
                  <div className="relative top-6 w-[220px] rounded-full bg-white px-6 py-6 text-center shadow-xl sm:top-10 sm:w-[300px] sm:px-10 sm:py-8">
                    <p className="text-4xl font-semibold text-slate-900 sm:text-5xl ">
                      {attendanceRate}%
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                      +10%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500 sm:mt-10">
              You earn $3,287 today, it&apos;s higher than last month. Keep up
              your good work!
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <div className=" card rounded-3xl p-4 text-center sm:text-left">
                <p className="text-xs uppercase tracking-[0.3em]">PRESENT </p>
                <p className="mt-2 text-xl font-semibold sm:mt-3 sm:text-2xl">
                  {stats.present}
                </p>
              </div>
              <div className=" card rounded-3xl p-4 text-center sm:text-left">
                <p className="text-xs uppercase tracking-[0.3em]">ABSENT </p>
                <p className="mt-2 text-xl font-semibold sm:mt-3 sm:text-2xl">
                  {stats.absent}
                </p>
              </div>
              <div className=" card rounded-3xl p-4 text-center sm:text-left">
                <p className="text-xs uppercase tracking-[0.3em]">ON LEAVE</p>
                <p className="mt-2 text-xl font-semibold sm:mt-3 sm:text-2xl">
                  {stats.onLeave}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2: Chart (left) + Insights (right) ── */}
        <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr] md:h-[700px]">
          <div className="flex flex-col gap-6">
            {/* Chart */}
            <div className=" card rounded-[2rem] p-8 shadow-sm ring-1 md:h-[500px] w-[100%] relative md:bottom-[390px] md:w-[738px]">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium ">Monthly Attendance</p>
                  <h2 className="mt-2 text-lg font-semibold sm:text-xl">
                    Employee attendance overview
                  </h2>
                </div>
                <span className="w-fit rounded-full px-3 py-1 text-sm font-semibold">
                  +24.3%
                </span>
              </div>

              <div className="mt-6 sm:mt-8">
                <div className="flex h-64 w-full items-end gap-2 px-2">
                  {salesBars.map((value, index) => {
                    const height = Math.min(value * 2, 100);
                    return (
                      <div
                        key={index}
                        className="flex flex-1 flex-col items-center"
                      >
                        <div className="relative flex h-52 w-full items-end justify-center">
                          <div className="absolute bottom-0 h-full w-4 rounded-full "></div>
                          <div
                            className="z-10 w-4 rounded-full bg-blue-500"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <p className="mt-2 text-[10px] text-slate-500 sm:text-xs">
                          {salesLabels[index]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Calendar — fills the red empty space below chart */}
            <div className="card rounded-[2rem] p-6 shadow-sm ring-1 sm:p-8 relative md:bottom-[390px] md:w-[738px]">
              <CalendarWidget leaves={leaves} />
            </div>
          </div>

          <div className=" card mx-auto w-full rounded-[2rem] p-5 shadow-sm ring-1 sm:p-8 md:h-[500px]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">Insights</p>
                  <p className="mt-2 text-lg font-semibold ">Quick view</p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                >
                  View all
                </button>
              </div>
              <div className="space-y-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Conversion rate</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    8.9%
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Avg. order value</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    $68.50
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
