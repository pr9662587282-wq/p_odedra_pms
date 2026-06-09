import { useState } from "react";
import User_Sidebar from "./User_Sidebar";
import Sidebar_Admin from "../admin_penal/Sidebar_Admin";
import { useParams, useLocation } from "react-router-dom";

// ── shadcn: Card ──
import { Card, CardContent } from "@/components/ui/card";
// ── shadcn: Badge ──
import { Badge } from "@/components/ui/badge";
// ── shadcn: Button ──
import { Button } from "@/components/ui/button";
// ── shadcn: Input ──
import { Input } from "@/components/ui/input";
// ── shadcn: Label ──
import { Label } from "@/components/ui/label";
// ── shadcn: Separator ──
import { Separator } from "@/components/ui/separator";
// ── shadcn: Table ──
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
// ── shadcn: Tooltip ──
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─────────────────────────────────────────────────────────────────
// Static attendance records — replace with API later:
// useEffect(() => axios.get('/api/attendance').then(r => setRecords(r.data)), [])
// ─────────────────────────────────────────────────────────────────
const ALL_RECORDS = [
  {
    date: "19-05-2026",
    entry: "10:09 AM",
    exit: "—",
    breakTime: "—",
    workHours: "—",
    checkInIp: "117.99.100.217",
    checkOutIp: "—",
  },
  {
    date: "18-05-2026",
    entry: "10:21 AM",
    exit: "09:06 PM",
    breakTime: "1:00",
    workHours: "9 hrs 45 mins",
    checkInIp: "223.182.183.0",
    checkOutIp: "117.99.100.217",
  },
  {
    date: "15-05-2026",
    entry: "10:08 AM",
    exit: "08:47 PM",
    breakTime: "1:13",
    workHours: "9 hrs 26 mins",
    checkInIp: "103.230.196.60",
    checkOutIp: "223.102.153.0",
  },
  {
    date: "14-05-2026",
    entry: "10:02 AM",
    exit: "07:17 PM",
    breakTime: "1:05",
    workHours: "8 hrs 10 mins",
    checkInIp: "103.230.196.60",
    checkOutIp: "103.238.106.60",
  },
  {
    date: "13-05-2026",
    entry: "09:58 AM",
    exit: "07:45 PM",
    breakTime: "0:46",
    workHours: "9 hrs 0 mins",
    checkInIp: "103.65.8.121",
    checkOutIp: "103.238.106.60",
  },
  {
    date: "12-05-2026",
    entry: "09:50 AM",
    exit: "07:30 PM",
    breakTime: "1:00",
    workHours: "8 hrs 40 mins",
    checkInIp: "103.65.8.121",
    checkOutIp: "103.238.106.60",
  },
  {
    date: "09-05-2026",
    entry: "10:15 AM",
    exit: "07:00 PM",
    breakTime: "0:45",
    workHours: "7 hrs 45 mins",
    checkInIp: "117.99.100.217",
    checkOutIp: "117.99.100.217",
  },
  {
    date: "08-05-2026",
    entry: "09:45 AM",
    exit: "06:50 PM",
    breakTime: "1:00",
    workHours: "8 hrs 5 mins",
    checkInIp: "103.65.8.121",
    checkOutIp: "103.65.8.121",
  },
  {
    date: "07-05-2026",
    entry: "10:00 AM",
    exit: "07:10 PM",
    breakTime: "1:10",
    workHours: "8 hrs 0 mins",
    checkInIp: "103.230.196.60",
    checkOutIp: "103.230.196.60",
  },
  {
    date: "06-05-2026",
    entry: "09:55 AM",
    exit: "07:20 PM",
    breakTime: "0:55",
    workHours: "8 hrs 30 mins",
    checkInIp: "117.99.100.217",
    checkOutIp: "117.99.100.217",
  },
  {
    date: "05-05-2026",
    entry: "10:05 AM",
    exit: "07:05 PM",
    breakTime: "1:00",
    workHours: "8 hrs 0 mins",
    checkInIp: "103.65.8.121",
    checkOutIp: "103.65.8.121",
  },
  {
    date: "02-05-2026",
    entry: "09:48 AM",
    exit: "06:48 PM",
    breakTime: "1:00",
    workHours: "8 hrs 0 mins",
    checkInIp: "103.230.196.60",
    checkOutIp: "103.230.196.60",
  },
  {
    date: "01-05-2026",
    entry: "10:10 AM",
    exit: "07:10 PM",
    breakTime: "1:00",
    workHours: "8 hrs 0 mins",
    checkInIp: "117.99.100.217",
    checkOutIp: "117.99.100.217",
  },
];

const ROWS_PER_PAGE = 5;

// ─────────────────────────────────────────────────────────────────
// Stat Card — colored gradient card with icon
// ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, gradient, icon }) {
  return (
    // ── shadcn Card ──
    <Card
      className={`rounded-3xl border-0 shadow-lg overflow-hidden ${gradient}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">
              {label}
            </p>
            <p className="text-3xl font-black text-white leading-none">
              {value}
            </p>
            {sub && <p className="text-xs text-white/60 mt-1">{sub}</p>}
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-sm">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────
// Work Hours progress bar inside table
// ─────────────────────────────────────────────────────────────────
function WorkBar({ hours }) {
  if (hours === "—")
    return <span className="text-slate-300 text-sm font-medium">—</span>;
  const match = hours.match(/(\d+)\s*hrs?\s*(\d+)?/);
  const h = match ? parseInt(match[1]) : 0;
  const m = match && match[2] ? parseInt(match[2]) : 0;
  const total = h + m / 60;
  const pct = Math.min(100, Math.round((total / 10) * 100));

  // color thresholds
  const barColor =
    total >= 9
      ? "bg-gradient-to-r from-emerald-400 to-green-500"
      : total >= 7
        ? "bg-gradient-to-r from-amber-400 to-orange-400"
        : "bg-gradient-to-r from-rose-400 to-pink-500";
  const textColor =
    total >= 9
      ? "text-emerald-600"
      : total >= 7
        ? "text-amber-600"
        : "text-rose-500";

  return (
    <div className="flex flex-col gap-1.5 min-w-[140px]">
      {/* hours text — bigger and colored */}
      <span className={`text-sm font-black ${textColor}`}>{hours}</span>
      {/* progress bar — taller and gradient */}
      <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner">
        <div
          className={`h-2.5 rounded-full ${barColor} shadow-sm transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────
export default function Attendance_show() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState(ALL_RECORDS);
  const { id } = useParams();
  const location = useLocation();

  const fromAdmin = location.state?.fromAdmin;
  const adminViewedFullName = location.state?.adminViewedFullName;

  const role = localStorage.getItem("role");

  const isAdminView = fromAdmin && role === "admin";
  const [fullName, setFullName] = useState(adminViewedFullName || "User");

  // Filter records by date range
  function handleFilter() {
    if (!fromDate && !toDate) {
      setRecords(ALL_RECORDS);
      setPage(1);
      return;
    }
    const filtered = ALL_RECORDS.filter((r) => {
      // convert dd-mm-yyyy → yyyy-mm-dd for comparison
      const parts = r.date.split("-");
      const d = `${parts[2]}-${parts[1]}-${parts[0]}`;
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      return true;
    });
    setRecords(filtered);
    setPage(1);
  }

  function handleReset() {
    setFromDate("");
    setToDate("");
    setRecords(ALL_RECORDS);
    setPage(1);
  }

  // Pagination
  const totalPages = Math.ceil(records.length / ROWS_PER_PAGE);
  const pageRecords = records.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE,
  );

  return (
    <div className=" card flex min-h-screen">
      {/* Sidebar */}
      {isAdminView ? <Sidebar_Admin /> : <User_Sidebar fullName={fullName} />}

      <div className="flex-1 md:ml-72">
        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-sky-700 px-6 py-8 pt-20 md:pt-8">
          {/* decorative blobs */}
          <div className="absolute -top-8 -right-8 h-36 w-36 rounded-full bg-white/10" />
          <div className="absolute bottom-0 left-1/3 h-20 w-20 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-sm shadow-lg">
              📊
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Attendance
              </h1>
              <p className="text-cyan-200 text-sm mt-0.5">
                Attendance Summary · May 2026
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {/* ── Date Filter Bar ── */}
          {/* ── shadcn Card ── */}
          <Card className="rounded-3xl border-0 shadow-md shadow-slate-200/60">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
                  {/* ── shadcn Label ── */}
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    From Date
                  </Label>
                  {/* ── shadcn Input ── */}
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="rounded-2xl border-2 border-slate-200 bg-slate-50 focus:border-teal-400 transition-all font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
                  {/* ── shadcn Label ── */}
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    To Date
                  </Label>
                  {/* ── shadcn Input ── */}
                  <Input
                    type="date"
                    value={toDate}
                    min={fromDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="rounded-2xl border-2 border-slate-200 bg-slate-50 focus:border-teal-400 transition-all font-medium"
                  />
                </div>

                <div className="flex gap-2 pb-0.5">
                  {/* ── shadcn Button ── */}
                  <Button
                    onClick={handleFilter}
                    className="rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold px-5 shadow-md shadow-teal-200"
                  >
                    🔍 Filter
                  </Button>
                  {/* ── shadcn Button (outline) ── */}
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Stat Cards Row 1 — Days / Late / Absent / Half Day ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Days"
              value="13"
              sub="This month"
              gradient="bg-gradient-to-br from-rose-500 to-pink-600"
              icon="📅"
            />
            <StatCard
              label="Late"
              value="0%"
              sub="0 occurrences"
              gradient="bg-gradient-to-br from-orange-500 to-amber-500"
              icon="⏰"
            />
            <StatCard
              label="Absent"
              value="0%"
              sub="0 days"
              gradient="bg-gradient-to-br from-sky-500 to-blue-600"
              icon="❌"
            />
            <StatCard
              label="Half Day"
              value="0"
              sub="Days"
              gradient="bg-gradient-to-br from-violet-500 to-purple-600"
              icon="🌓"
            />
          </div>

          {/* ── Stat Cards Row 2 — Office / Worked / Productivity / PL ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Office"
              value="102h 0m"
              sub="Office hours"
              gradient="bg-gradient-to-br from-teal-500 to-emerald-600"
              icon="🏢"
            />
            <StatCard
              label="Total Worked"
              value="102h 0m"
              sub="Worked hours"
              gradient="bg-gradient-to-br from-indigo-500 to-blue-600"
              icon="💼"
            />
            <StatCard
              label="Productivity Rate"
              value="100%"
              sub="Excellent"
              gradient="bg-gradient-to-br from-emerald-500 to-green-600"
              icon="🚀"
            />
            <StatCard
              label="PL Leaves (2026)"
              value="0"
              sub="Paid leaves used"
              gradient="bg-gradient-to-br from-amber-500 to-yellow-500"
              icon="🏖️"
            />
          </div>

          {/* ── Attendance Table Card ── */}
          {/* ── shadcn Card ── */}
          <Card className="rounded-3xl border-0 shadow-xl shadow-slate-200/60 overflow-hidden">
            {/* Colored top strip */}
            <div className="h-1.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-100 text-lg">
                  📋
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Attendance Records
                  </h2>
                  <p className="text-xs text-slate-400">
                    Showing {pageRecords.length} of {records.length} entries
                  </p>
                </div>
              </div>
              {/* ── shadcn Badge ── */}
              <Badge className="bg-teal-100 text-teal-700 border-0 hover:bg-teal-100 font-bold text-xs px-3 py-1 rounded-full">
                {records.length} records
              </Badge>
            </div>

            {/* ── shadcn Separator ── */}
            <Separator />

            {/* Table — scrollable on mobile */}
            <div className=" card w-full overflow-x-auto">
              {/* ── shadcn Table ── */}
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/80 hover:bg-slate-50 border-b-2 border-slate-200">
                    {[
                      "Date",
                      "Entry Time",
                      "Exit Time",
                      "Break Time",
                      "Working Hours",
                      "IP Details",
                    ].map((h) => (
                      <TableHead
                        key={h}
                        className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap"
                      >
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <span className="text-4xl">📭</span>
                          <p className="text-sm font-medium">
                            No records found for selected range
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pageRecords.map((r, i) => (
                      <TableRow
                        key={i}
                        className="group hover:bg-gradient-to-r hover:from-teal-50/40 hover:to-cyan-50/30 transition-all duration-150 border-b border-slate-100 last:border-0"
                      >
                        {/* Date — day bubble + full date */}
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {/* day number bubble */}
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-sm font-black text-white shadow-md shadow-teal-200">
                              {r.date.split("-")[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 whitespace-nowrap">
                                {r.date}
                              </p>
                              <p className="text-xs text-slate-400">
                                Working day
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Entry Time — green pill */}
                        <TableCell className="px-5 py-4">
                          {/* ── shadcn Badge ── */}
                          <Badge className="bg-emerald-500 text-white border-0 hover:bg-emerald-600 font-bold text-sm px-3 py-1.5 rounded-xl shadow-sm shadow-emerald-200 gap-1.5">
                            <span className="text-base">↑</span>
                            {r.entry}
                          </Badge>
                        </TableCell>

                        {/* Exit Time — rose pill */}
                        <TableCell className="px-5 py-4">
                          {r.exit === "—" ? (
                            <span className="text-slate-300 text-sm font-medium">
                              —
                            </span>
                          ) : (
                            // ── shadcn Badge ──
                            <Badge className="bg-rose-500 text-white border-0 hover:bg-rose-600 font-bold text-sm px-3 py-1.5 rounded-xl shadow-sm shadow-rose-200 gap-1.5">
                              <span className="text-base">↓</span>
                              {r.exit}
                            </Badge>
                          )}
                        </TableCell>

                        {/* Break Time — amber pill */}
                        <TableCell className="px-5 py-4">
                          {r.breakTime === "—" ? (
                            <span className="text-slate-300 text-sm font-medium">
                              —
                            </span>
                          ) : (
                            // ── shadcn Badge ──
                            <Badge className="bg-amber-500 text-white border-0 hover:bg-amber-600 font-bold text-sm px-3 py-1.5 rounded-xl shadow-sm shadow-amber-200 gap-1.5">
                              ☕ {r.breakTime}h
                            </Badge>
                          )}
                        </TableCell>

                        {/* Working Hours — colored text + gradient bar */}
                        <TableCell className="px-5 py-4">
                          <WorkBar hours={r.workHours} />
                        </TableCell>

                        {/* IP Details — shadcn Tooltip */}
                        <TableCell className="px-5 py-4">
                          {/* ── shadcn Tooltip ── */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="cursor-pointer space-y-1.5 group-hover:opacity-100">
                                  {/* Check-in IP */}
                                  <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-2.5 py-1.5">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 shadow-sm" />
                                    <span className="text-xs font-semibold text-emerald-700 font-mono">
                                      {r.checkInIp}
                                    </span>
                                  </div>
                                  {/* Check-out IP */}
                                  {r.checkOutIp !== "—" && (
                                    <div className="flex items-center gap-2 bg-rose-50 rounded-xl px-2.5 py-1.5">
                                      <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0 shadow-sm" />
                                      <span className="text-xs font-semibold text-rose-600 font-mono">
                                        {r.checkOutIp}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="left"
                                className="rounded-xl text-xs space-y-1 p-3"
                              >
                                <p className="font-bold text-emerald-600">
                                  ✓ In: {r.checkInIp}
                                </p>
                                <p className="font-bold text-rose-500">
                                  ✕ Out: {r.checkOutIp}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-100">
                <p className="text-xs text-slate-400 font-medium">
                  Showing {(page - 1) * ROWS_PER_PAGE + 1}–
                  {Math.min(page * ROWS_PER_PAGE, records.length)} of{" "}
                  {records.length} entries
                </p>
                <div className="flex items-center gap-1.5">
                  {/* Prev */}
                  {/* ── shadcn Button ── */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-xl border-2 border-slate-200 text-xs font-semibold h-8 px-3 disabled:opacity-40"
                  >
                    ← Prev
                  </Button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      // ── shadcn Button ── for each page number
                      <Button
                        key={n}
                        size="sm"
                        onClick={() => setPage(n)}
                        className={`rounded-xl h-8 w-8 text-xs font-bold p-0 ${
                          page === n
                            ? "bg-gradient-to-br from-teal-600 to-cyan-600 text-white border-0 shadow-md shadow-teal-200"
                            : "bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {n}
                      </Button>
                    ),
                  )}

                  {/* Next */}
                  {/* ── shadcn Button ── */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-xl border-2 border-slate-200 text-xs font-semibold h-8 px-3 disabled:opacity-40"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
