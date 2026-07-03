import { useState, useEffect } from "react";
import axios from "axios";
import User_Sidebar from "./User_Sidebar";
import Sidebar_Admin from "../admin_penal/Sidebar_Admin";
import { useParams, useLocation } from "react-router-dom";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Toaster, toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const ROWS_PER_PAGE = 5;
/*const STATIC_RECORDS = [
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
      {
        date: "30-04-2026",
        entry: "09:52 AM",
        exit: "07:00 PM",
        breakTime: "1:00",
        workHours: "8 hrs 8 mins",
        checkInIp: "103.65.8.121",
        checkOutIp: "103.65.8.121",
      },
      {
        date: "29-04-2026",
        entry: "10:00 AM",
        exit: "07:15 PM",
        breakTime: "1:05",
        workHours: "8 hrs 10 mins",
        checkInIp: "103.230.196.60",
        checkOutIp: "103.230.196.60",
      },
      {
        date: "28-04-2026",
        entry: "09:47 AM",
        exit: "06:55 PM",
        breakTime: "0:50",
        workHours: "8 hrs 18 mins",
        checkInIp: "117.99.100.217",
        checkOutIp: "117.99.100.217",
      },
      {
        date: "25-04-2026",
        entry: "10:03 AM",
        exit: "07:08 PM",
        breakTime: "1:00",
        workHours: "8 hrs 5 mins",
        checkInIp: "103.65.8.121",
        checkOutIp: "103.65.8.121",
      },
      {
        date: "24-04-2026",
        entry: "09:55 AM",
        exit: "07:00 PM",
        breakTime: "1:00",
        workHours: "8 hrs 5 mins",
        checkInIp: "103.230.196.60",
        checkOutIp: "103.230.196.60",
      },
      {
        date: "23-04-2026",
        entry: "10:10 AM",
        exit: "07:20 PM",
        breakTime: "1:10",
        workHours: "8 hrs 0 mins",
        checkInIp: "117.99.100.217",
        checkOutIp: "117.99.100.217",
      },
      {
        date: "22-04-2026",
        entry: "09:50 AM",
        exit: "06:50 PM",
        breakTime: "1:00",
        workHours: "8 hrs 0 mins",
        checkInIp: "103.65.8.121",
        checkOutIp: "103.65.8.121",
      },
      {
        date: "21-04-2026",
        entry: "10:00 AM",
        exit: "07:05 PM",
        breakTime: "1:00",
        workHours: "8 hrs 5 mins",
        checkInIp: "103.230.196.60",
        checkOutIp: "103.230.196.60",
      },
      {
        date: "18-04-2026",
        entry: "09:45 AM",
        exit: "06:45 PM",
        breakTime: "0:55",
        workHours: "8 hrs 5 mins",
        checkInIp: "117.99.100.217",
        checkOutIp: "117.99.100.217",
      },
      {
        date: "17-04-2026",
        entry: "10:05 AM",
        exit: "07:10 PM",
        breakTime: "1:05",
        workHours: "8 hrs 0 mins",
        checkInIp: "103.65.8.121",
        checkOutIp: "103.65.8.121",
      },
      {
        date: "16-04-2026",
        entry: "09:58 AM",
        exit: "07:00 PM",
        breakTime: "1:00",
        workHours: "8 hrs 2 mins",
        checkInIp: "103.230.196.60",
        checkOutIp: "103.230.196.60",
      },
      {
        date: "15-04-2026",
        entry: "10:00 AM",
        exit: "07:00 PM",
        breakTime: "1:00",
        workHours: "8 hrs 0 mins",
        checkInIp: "117.99.100.217",
        checkOutIp: "117.99.100.217",
      },
      {
        date: "14-04-2026",
        entry: "09:48 AM",
        exit: "06:52 PM",
        breakTime: "1:00",
        workHours: "8 hrs 4 mins",
        checkInIp: "103.65.8.121",
        checkOutIp: "103.65.8.121",
      },
      {
        date: "11-04-2026",
        entry: "10:02 AM",
        exit: "07:05 PM",
        breakTime: "1:00",
        workHours: "8 hrs 3 mins",
        checkInIp: "103.230.196.60",
        checkOutIp: "103.230.196.60",
      },
      {
        date: "10-04-2026",
        entry: "09:55 AM",
        exit: "07:00 PM",
        breakTime: "1:00",
        workHours: "8 hrs 5 mins",
        checkInIp: "117.99.100.217",
        checkOutIp: "117.99.100.217",
      },
      {
        date: "09-04-2026",
        entry: "10:00 AM",
        exit: "07:10 PM",
        breakTime: "1:10",
        workHours: "8 hrs 0 mins",
        checkInIp: "103.65.8.121",
        checkOutIp: "103.65.8.121",
      },
      {
        date: "08-04-2026",
        entry: "09:50 AM",
        exit: "06:55 PM",
        breakTime: "1:00",
        workHours: "8 hrs 5 mins",
        checkInIp: "103.230.196.60",
        checkOutIp: "103.230.196.60",
      },
    ];*/

// ── Token helper ──────────────────────────────────────────────────
const getConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});
// ── Count working days (Mon-Fri) in a month, up to a given day ──
function countWorkingDays(year, month, uptoDay) {
  let count = 0;
  for (let d = 1; d <= uptoDay; d++) {
    const day = new Date(year, month - 1, d).getDay(); // 0=Sun, 6=Sat
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

// ── Calculate stats from records array ───────────────────────────
// ── Fixed office duration per completed day (8 hours 30 mins) ──
// ── Fixed office duration per completed day (8 hours 30 mins) ──
const FIXED_OFFICE_MIN = 8 * 60 + 30; // 510 minutes

function calcStats(records, month, year) {
  let present = 0;
  let late = 0;
  let absent = 0;
  let totalWorkMin = 0; // ← DYNAMIC (real data se)
  let totalOfficeMin = 0; // ← FIXED (8:30 per day)
  let totalStatusPercent = 0;

  const today = new Date();
  const isCurrentMonth =
    month === today.getMonth() + 1 && year === today.getFullYear();

  const daysInMonth = new Date(year, month, 0).getDate();
  const uptoDay = isCurrentMonth ? today.getDate() : daysInMonth;

  const totalDays = countWorkingDays(year, month, uptoDay);

  records.forEach((r) => {
    const hasEntry = r.entry && r.entry !== "—";
    const hasExit = r.exit && r.exit !== "—";

    if (hasEntry) {
      present++;

      const parts = r.entry.split(/[: ]/);
      const h = parseInt(parts[0]);
      const m = parseInt(parts[1]);
      const isAM = r.entry.toUpperCase().includes("AM");
      const h24 = isAM ? (h === 12 ? 0 : h) : h === 12 ? 12 : h + 12;

      if (h24 > 10 || (h24 === 10 && m > 0)) late++;

      if (hasExit) {
        // ✅ FIXED — Total Office ke liye hamesha 8:30 per completed day
        totalOfficeMin += FIXED_OFFICE_MIN;

        // ✅ DYNAMIC — Total Worked ke liye REAL entry/exit se calculate
        const parseTime = (t) => {
          const p = t.split(/[: ]/);
          let hh = parseInt(p[0]);
          let mm = parseInt(p[1]);
          const am = t.toUpperCase().includes("AM");
          if (!am && hh !== 12) hh += 12;
          if (am && hh === 12) hh = 0;
          return hh * 60 + mm;
        };

        const entryMin = parseTime(r.entry);
        const exitMin = parseTime(r.exit);
        const officeMinTodayReal = Math.max(0, exitMin - entryMin);

        let breakMin = 0;
        if (r.breakTime && r.breakTime !== "—") {
          const bp = r.breakTime.split(":");
          breakMin = parseInt(bp[0] || 0) * 60 + parseInt(bp[1] || 0);
        }
        const workedMinToday = Math.max(0, officeMinTodayReal - breakMin);
        totalWorkMin += workedMinToday; // ✅ table rows se exact match

        const totalHrs = workedMinToday / 60;
        totalStatusPercent += Math.min(
          100,
          Math.round((workedMinToday / FIXED_OFFICE_MIN) * 100),
        );
      }
    } else {
      absent++;
    }
  });

  const attendancePercent =
    totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;
  const latePercent = totalDays > 0 ? Math.round((late / totalDays) * 100) : 0;
  const absentPct = totalDays > 0 ? Math.round((absent / totalDays) * 100) : 0;
  const productivity =
    totalDays > 0 ? Math.round(totalStatusPercent / totalDays) : 0;

  const fmtMin = (min) => `${Math.floor(min / 60)}h ${min % 60}m`;

  return {
    totalDays,
    present,
    late,
    absent,
    latePercent,
    absentPct,
    productivity,
    attendancePercent,
    totalWorkHours: fmtMin(totalWorkMin), // dynamic
    totalOfficeHours: fmtMin(totalOfficeMin), // fixed
  };
}
// ── Stat Card ─────────────────────────────────────────────────────
function StatCard({ label, value, sub, gradient, icon }) {
  return (
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

// ── Work Hours bar ────────────────────────────────────────────────
function WorkBar({ hours }) {
  if (!hours || hours === "—")
    return <span className="text-slate-300 text-sm font-medium">—</span>;
  const match = hours.match(/(\d+)\s*hrs?\s*(\d+)?/);
  const h = match ? parseInt(match[1]) : 0;
  const m = match && match[2] ? parseInt(match[2]) : 0;
  const total = h + m / 60;
  const pct = Math.min(100, Math.round((total / 10) * 100));
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
      <span className={`text-sm font-black ${textColor}`}>{hours}</span>
      <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner">
        <div
          className={`h-2.5 rounded-full ${barColor} shadow-sm transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function Attendance_show() {
  const { id } = useParams();
  const location = useLocation();

  const fromAdmin = location.state?.fromAdmin;
  const adminViewedFullName = location.state?.adminViewedFullName;
  const role = localStorage.getItem("role");
  const isAdminView = fromAdmin && role === "admin";

  const [fullName, setFullName] = useState(adminViewedFullName || "User");
  const [allRecords, setAllRecords] = useState([]); // original full list
  const [records, setRecords] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({
    entry: "",
    exit: "",
    breakTime: "",
  });
  const [saving, setSaving] = useState(false);
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

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // filtered list shown in table
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [importDays, setImportDays] = useState("10");
  function getStatusPercent(r) {
    if (!r.entry || r.entry === "—") return 0;
    if (!r.exit || r.exit === "—") return 0; // half day / incomplete

    const match = r.workHours?.match(/(\d+)\s*hrs?\s*(\d+)?/);
    if (!match) return 0;

    const h = parseInt(match[1] || 0);
    const m = parseInt(match[2] || 0);
    const total = h + m / 60;

    // assume 10 hrs = 100%
    const percent = Math.min(100, Math.round((total / 10) * 100));
    return percent;
  }

  // filter data to auto month wise and show

  useEffect(() => {
    const filtered = allRecords.filter((r) => {
      const parts = r.date.split("/");
      return (
        Number(parts[1]) === selectedMonth && Number(parts[2]) === selectedYear
      );
    });
    setRecords(filtered);
  }, [selectedMonth, selectedYear, allRecords]);
  // ── Fetch real attendance data on mount ──────────────────────
  // ── Fetch real attendance data on mount ──────────────────────
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);

        const targetUserId = id || localStorage.getItem("userId");

        const res = await axios.get(
          `http://localhost:5000/history/${targetUserId}`,
          getConfig(),
        );

        const realData = res.data.records || [];
        console.log("API Data:", realData);

        // ONLY dynamic data — records apne aap doosre useEffect
        // se filter ho jayenge (selectedMonth/selectedYear ke basis par)
        setAllRecords(realData);
      } catch (err) {
        console.error("Failed to fetch attendance history:", err);

        // fallback: still NO static data
        setAllRecords([]);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);
  // ── Computed stats from all records ─────────────────────────
  const stats = calcStats(records, selectedMonth, selectedYear);

  // ── Filter by date range ─────────────────────────────────────
  function handleFilter() {
    if (!fromDate && !toDate) {
      setRecords(allRecords);
      setPage(1);
      return;
    }
    const filtered = allRecords.filter((r) => {
      const parts = r.date.split("/");
      const d = `${parts[2]}-${parts[1]}-${parts[0]}`; // yyyy-mm-dd
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
    setRecords(allRecords);
    setPage(1);
  }
  // ── Admin: Edit / Delete a record ─────────────────────────────
  // ── Admin: Edit a record — open popup pre-filled with current values ──
  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setEditForm({
      entry: convertTo24Hr(record.entry),
      exit:
        record.exit && record.exit !== "—" ? convertTo24Hr(record.exit) : "",
      breakTime:
        record.breakTime && record.breakTime !== "—"
          ? record.breakTime
          : "0:00",
    });
    setEditModalOpen(true);
  };

  // ── Admin: Save the edited record to the backend ──
  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    if (!editForm.entry) {
      toast.error("Entry time is required");
      return;
    }

    setSaving(true);
    try {
      const entry12 = convertTo12Hr(editForm.entry);
      const exit12 = editForm.exit ? convertTo12Hr(editForm.exit) : "—";

      // ── recompute working hours from the new times ──
      let workHours = "—";
      if (editForm.entry && editForm.exit) {
        const [eh, em] = editForm.entry.split(":").map(Number);
        const [xh, xm] = editForm.exit.split(":").map(Number);
        let totalMin = xh * 60 + xm - (eh * 60 + em);

        const bParts = (editForm.breakTime || "0:00").split(":");
        const breakMin =
          (parseInt(bParts[0]) || 0) * 60 + (parseInt(bParts[1]) || 0);
        totalMin = Math.max(0, totalMin - breakMin);

        workHours = `${Math.floor(totalMin / 60)} hrs ${totalMin % 60} mins`;
      }

      const payload = {
        entry: entry12,
        exit: exit12,
        breakTime: editForm.breakTime || "—",
        workHours,
      };

      await axios.put(
        `http://localhost:5000/history/${editingRecord._id}`,
        payload,
        getConfig(),
      );

      // update local state so the table reflects the change immediately
      setAllRecords((prev) =>
        prev.map((r) =>
          r._id === editingRecord._id ? { ...r, ...payload } : r,
        ),
      );

      toast.success("Attendance record updated successfully");
      setEditModalOpen(false);
      setEditingRecord(null);
    } catch (err) {
      console.error("Failed to update record:", err);
      toast.error("Failed to update record");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async (record) => {
    if (!window.confirm(`Delete attendance record for ${record.date}?`)) return;
    try {
      await axios.delete(
        `http://localhost:5000/history/${record._id}`,
        getConfig(),
      );
      setAllRecords((prev) => prev.filter((r) => r._id !== record._id));
      toast.success("Record deleted successfully");
    } catch (err) {
      console.error("Failed to delete record:", err);
      toast.error("Failed to delete record");
    }
  };

  const uploadToDrive = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "http://localhost:5000/api/google-drive/upload-drive",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("Google Drive Upload Success");
      console.log(res.data);

      //alert("Uploaded to Google Drive Successfully");
    } catch (err) {
      console.error(err);
      alert("Google Drive Upload Failed");
    }
  };

  // ── Export CSV ───────────────────────────────────────────────
  const handleExportCsv = async () => {
    const recordsToExport = records.slice(0, Number(importDays));
    const BOM = "\uFEFF";
    const formatForExcel = (dateStr) => {
      if (!dateStr) return "";
      const parts = dateStr.split("-");
      if (parts.length === 3 && parts[0].length === 2) {
        return `="${parts[1]}/${parts[0]}/${parts[2]}"`;
      }
      return `\t${dateStr}`;
    };
    const formattedData = recordsToExport.map((r) => ({
      date: formatForExcel(r.date),
      entry: r.entry,
      exit: r.exit,
      breakTime: r.breakTime,
      workHours: r.workHours,
      statusPercent: getStatusPercent(r),
      checkInIp: r.checkInIp,
      checkOutIp: r.checkOutIp,
    }));

    const csv = Papa.unparse(formattedData);
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });

    const file = new File([blob], "Attendance_Report.csv", {
      type: "text/csv",
    });

    // Upload to Drive
    await uploadToDrive(file);
    toast.custom(() => (
      <div className="flex items-center gap-4 rounded-2xl border border-green-200 bg-white px-5 py-4 shadow-2xl min-w-[350px]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl">
          ✅
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-green-700">CSV Export Successful</h3>

          <p className="text-sm text-slate-500">
            Attendance CSV uploaded to Google Drive successfully.
          </p>
        </div>
      </div>
    ));
    // Local download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Attendance_Report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  // ── Export PDF ───────────────────────────────────────────────
  const handleExportPdf = async () => {
    const recordsToExport = records.slice(0, Number(importDays));
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const marginLeft = 14;

    // summary for PDF
    let present = 0,
      late = 0,
      absent = 0,
      totalMinutes = 0;
    recordsToExport.forEach((r) => {
      if (r.entry && r.exit && r.entry !== "—" && r.exit !== "—") {
        present++;
        const parts = r.entry.split(/[: ]/);
        const h24 = r.entry.includes("AM")
          ? parseInt(parts[0]) === 12
            ? 0
            : parseInt(parts[0])
          : parseInt(parts[0]) === 12
            ? 12
            : parseInt(parts[0]) + 12;
        if (h24 > 10 || (h24 === 10 && parseInt(parts[1]) > 0)) late++;
        if (r.workHours && r.workHours !== "—") {
          const m = r.workHours.match(/(\d+)\s*hrs?\s*(\d+)?/);
          if (m) totalMinutes += parseInt(m[1] || 0) * 60 + parseInt(m[2] || 0);
        }
      } else {
        absent++;
      }
    });

    const totalDays = recordsToExport.length;
    const wh = Math.floor(totalMinutes / 60);
    const wm = totalMinutes % 60;
    const workingPercent =
      totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;

    const now = new Date();
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
    const reportDate = `${String(now.getDate()).padStart(2, "0")}-${monthNames[now.getMonth()].slice(0, 3)}-${now.getFullYear()}`;
    const reportTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Header
    doc.setFillColor(20, 50, 100);
    doc.rect(0, 0, pageWidth, 50, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("ABC TECHNOLOGIES PVT. LTD.", pageWidth / 2, 25, {
      align: "center",
    });
    doc.setFontSize(14);
    doc.text("Employee Attendance Report", pageWidth / 2, 40, {
      align: "center",
    });

    // Employee info box
    const infoY = 55;
    doc.setFillColor(245, 248, 255);
    doc.rect(marginLeft, infoY, pageWidth - marginLeft * 2, 90, "F");
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(marginLeft, infoY, pageWidth - marginLeft * 2, 90);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(20, 50, 100);
    doc.text("Employee Information", marginLeft + 12, infoY + 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text("Employee Name:", marginLeft + 12, infoY + 32);
    doc.setFont("helvetica", "bold");
    doc.text(fullName, marginLeft + 55, infoY + 32);
    doc.setFont("helvetica", "normal");
    doc.text("Report Period:", pageWidth / 2, infoY + 32);
    doc.setFont("helvetica", "bold");
    doc.text(
      monthNames[now.getMonth()] + " " + now.getFullYear(),
      pageWidth / 2 + 45,
      infoY + 32,
    );
    doc.setFont("helvetica", "normal");
    doc.text("Generated On:", pageWidth / 2, infoY + 47);
    doc.setFont("helvetica", "bold");
    doc.text(reportDate, pageWidth / 2 + 45, infoY + 47);

    // Summary
    const summaryY = infoY + 100;
    doc.setFillColor(20, 50, 100);
    doc.rect(marginLeft, summaryY, pageWidth - marginLeft * 2, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text("ATTENDANCE SUMMARY", pageWidth / 2, summaryY + 8, {
      align: "center",
    });

    autoTable(doc, {
      body: [
        [
          {
            content: "Total Days:",
            styles: { fontStyle: "bold", textColor: [20, 50, 100] },
          },
          { content: String(totalDays) },
          {
            content: "Present:",
            styles: { fontStyle: "bold", textColor: [20, 50, 100] },
          },
          { content: String(present) },
          {
            content: "Late:",
            styles: { fontStyle: "bold", textColor: [20, 50, 100] },
          },
          { content: String(late), styles: { textColor: [245, 158, 11] } },
          {
            content: "Absent:",
            styles: { fontStyle: "bold", textColor: [20, 50, 100] },
          },
          { content: String(absent), styles: { textColor: [239, 68, 68] } },
        ],
        [
          {
            content: "Total Hours:",
            styles: { fontStyle: "bold", textColor: [20, 50, 100] },
          },
          { content: `${wh}h ${wm}m` },
          {
            content: "Working %:",
            styles: { fontStyle: "bold", textColor: [20, 50, 100] },
          },
          {
            content: `${workingPercent}%`,
            styles: { textColor: [34, 197, 94] },
          },
          { content: "" },
          { content: "" },
          { content: "" },
          { content: "" },
        ],
      ],
      startY: summaryY + 15,
      theme: "plain",
      margin: { left: marginLeft, right: marginLeft },
      styles: { fontSize: 11, cellPadding: 4, fillColor: [245, 248, 255] },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 30 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { cellWidth: 35 },
        5: { cellWidth: 25 },
        6: { cellWidth: 30 },
        7: { cellWidth: 25 },
      },
    });

    // Details table
    const tableY = doc.lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(20, 50, 100);
    doc.text("Attendance Details", marginLeft, tableY);

    autoTable(doc, {
      head: [
        ["Date", "In Time", "Out Time", "Break", "Working Hrs", "Status %"],
      ],
      body: recordsToExport.map((r) => {
        let status = "Absent";
        if (r.entry && r.exit && r.entry !== "—" && r.exit !== "—") {
          const p = r.entry.split(/[: ]/);
          const h24 = r.entry.includes("AM")
            ? parseInt(p[0]) === 12
              ? 0
              : parseInt(p[0])
            : parseInt(p[0]) === 12
              ? 12
              : parseInt(p[0]) + 12;
          status =
            h24 > 10 || (h24 === 10 && parseInt(p[1]) > 0) ? "Late" : "Present";
        }
        return [
          r.date,
          r.entry || "—",
          r.exit || "—",
          r.breakTime || "—",
          r.workHours || "—",
          `${getStatusPercent(r)}%`,
        ];
      }),
      startY: tableY + 8,
      theme: "grid",
      headStyles: {
        fillColor: [20, 50, 100],
        textColor: 255,
        fontSize: 10,
        fontStyle: "bold",
      },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 28 },
        2: { cellWidth: 28 },
        3: { cellWidth: 22 },
        4: { cellWidth: 30 },
        5: { cellWidth: 25 },
      },
    });

    const finalY = doc.lastAutoTable?.finalY || 200;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Generated By : Employee Attendance Management System",
      marginLeft,
      finalY + 15,
    );
    doc.text(
      `Generated On : ${reportDate} ${reportTime}`,
      marginLeft,
      finalY + 23,
    );
    const pdfBlob = doc.output("blob");

    const file = new File([pdfBlob], "Attendance_Report.pdf", {
      type: "application/pdf",
    });
    await uploadToDrive(file);
    // Upload automatically
    toast.custom(() => (
      <div className="flex justify-center w-full">
        <div className="flex items-center gap-4 rounded-2xl border border-red-200 bg-white px-5 py-4 shadow-2xl min-w-[350px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl">
            📄
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-red-600">PDF Export Successful</h3>
            <p className="text-sm text-slate-500">
              Attendance PDF uploaded to Google Drive successfully.
            </p>
          </div>
        </div>
      </div>
    ));

    // Optional local download
    doc.save("Attendance_Report.pdf");
  };

  // ── Pagination ───────────────────────────────────────────────
  const totalPages = Math.ceil(records.length / ROWS_PER_PAGE);
  const pageRecords = records.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE,
  );

  // ── Current month + year label ───────────────────────────────
  const monthLabel = `${monthNames[selectedMonth - 1]} ${selectedYear}`;

  // ── Convert "10:09 AM" -> "10:09" (24hr, for <input type="time">) ──
  function convertTo24Hr(timeStr) {
    if (!timeStr || timeStr === "—") return "";
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier?.toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (modifier?.toUpperCase() === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  // ── Convert "10:09" (24hr) -> "10:09 AM" ──
  function convertTo12Hr(timeStr24) {
    if (!timeStr24) return "—";
    let [hours, minutes] = timeStr24.split(":").map(Number);
    const modifier = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${String(minutes).padStart(2, "0")} ${modifier}`;
  }
  return (
    <>
      <div className="card flex min-h-screen  flex-col md:flex-row**  bg-slate-50">
        {isAdminView ? <Sidebar_Admin /> : <User_Sidebar fullName={fullName} />}

        <div className="flex-1 md:ml-72">
          {/* Hero Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-sky-700 px-6 py-8 pt-20 md:pt-8">
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
                  Attendance Summary · {monthLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-6">
            {/* Filter Bar */}
            <Card className="rounded-3xl border-0 shadow-md shadow-slate-200/60">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      From Date
                    </Label>
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="rounded-2xl border-2 border-slate-200 bg-slate-50 focus:border-teal-400 transition-all font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      To Date
                    </Label>
                    <Input
                      type="date"
                      value={toDate}
                      min={fromDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="rounded-2xl border-2 border-slate-200 bg-slate-50 focus:border-teal-400 transition-all font-medium"
                    />
                  </div>
                  <div className="flex gap-2 pb-0.5 flex-wrap">
                    <Button
                      onClick={handleFilter}
                      className="rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
                    >
                      🔍 Filter
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="rounded-2xl"
                    >
                      Reset
                    </Button>
                    <select
                      value={importDays}
                      onChange={(e) => setImportDays(e.target.value)}
                      className="rounded-2xl border-2 border-slate-200 px-3 text-sm font-medium text-slate-600 bg-white"
                    >
                      <option value="10">10 Days</option>
                      <option value="15">15 Days</option>
                      <option value="30">30 Days</option>
                    </select>
                    <Button
                      onClick={handleExportCsv}
                      className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                    >
                      📊 Export CSV
                    </Button>
                    <Button
                      onClick={handleExportPdf}
                      className="rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700"
                    >
                      📄 Export PDF
                    </Button>
                    <select
                      value={selectedMonth}
                      onChange={(e) => {
                        setSelectedMonth(Number(e.target.value));
                        setPage(1);
                      }}
                      className="rounded-2xl border-2 border-slate-200 px-3 text-sm font-medium text-slate-600 bg-white"
                    >
                      {monthNames.map((name, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          {name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(Number(e.target.value));
                        setPage(1);
                      }}
                      className="rounded-2xl border-2 border-slate-200 px-3 text-sm font-medium text-slate-600 bg-white"
                    >
                      {Array.from(
                        { length: 3 },
                        (_, i) => new Date().getFullYear() - 1 + i,
                      ).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Stat Cards Row 1 — computed from real data ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Days"
                value={records.length}
                sub="Total records"
                gradient="bg-gradient-to-br from-rose-500 to-pink-600"
                icon="📅"
              />
              <StatCard
                label="Late"
                value={`${stats.latePercent}%`}
                sub={`${stats.late} occurrences`}
                gradient="bg-gradient-to-br from-orange-500 to-amber-500"
                icon="⏰"
              />
              <StatCard
                label="Absent"
                value={`${stats.absentPct}%`}
                sub={`${stats.absent} days`}
                gradient="bg-gradient-to-br from-sky-500 to-blue-600"
                icon="❌"
              />
              <StatCard
                label="Present"
                value={stats.present}
                sub="Days present"
                gradient="bg-gradient-to-br from-violet-500 to-purple-600"
                icon="✅"
              />
            </div>

            {/* ── Stat Cards Row 2 — computed from real data ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Office"
                value={stats.totalOfficeHours}
                sub="Office hours"
                gradient="bg-gradient-to-br from-teal-500 to-emerald-600"
                icon="🏢"
              />
              <StatCard
                label="Total Worked"
                value={stats.totalWorkHours}
                sub="Net work hours"
                gradient="bg-gradient-to-br from-indigo-500 to-blue-600"
                icon="💼"
              />
              <StatCard
                label="Attendance %"
                value={`${stats.attendancePercent}%`}
                sub="Overall attendance"
                gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                icon="📈"
              />
              <StatCard
                label="Productivity"
                value={`${stats.productivity}%`}
                sub={
                  stats.productivity >= 80 ? "Excellent" : "Needs improvement"
                }
                gradient="bg-gradient-to-br from-emerald-500 to-green-600"
                icon="🚀"
              />
              <StatCard
                label="Half Day"
                value="0"
                sub="Days"
                gradient="bg-gradient-to-br from-amber-500 to-yellow-500"
                icon="🌓"
              />
            </div>

            {/* Attendance Table */}
            <Card className="rounded-3xl border-0 shadow-xl shadow-slate-200/60 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500" />

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
                <Badge className="bg-teal-100 text-teal-700 border-0 hover:bg-teal-100 font-bold text-xs px-3 py-1 rounded-full">
                  {records.length} records
                </Badge>
              </div>

              <Separator />

              <div className="card w-full overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/80 hover:bg-slate-50 border-b-2 border-slate-200">
                      {[
                        "Date",
                        "Entry Time",
                        "Exit Time",
                        "Break Time",
                        "Working Hours",
                        "Status %",
                        "IP Details",
                        ...(isAdminView ? ["Actions"] : []),
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
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-16">
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <span className="text-4xl animate-spin">⏳</span>
                            <p className="text-sm font-medium">
                              Loading attendance records...
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : pageRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-16">
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <span className="text-4xl">📭</span>
                            <p className="text-sm font-medium">
                              No records found
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
                          {/* Date */}
                          <TableCell className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-sm font-black text-white shadow-md shadow-teal-200">
                                {r.date?.split("/")[0]}
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

                          {/* Entry */}
                          <TableCell className="px-5 py-4">
                            <Badge className="bg-emerald-500 text-white border-0 hover:bg-emerald-600 font-bold text-sm px-3 py-1.5 rounded-xl shadow-sm shadow-emerald-200 gap-1.5">
                              <span className="text-base">↑</span> {r.entry}
                            </Badge>
                          </TableCell>

                          {/* Exit */}
                          <TableCell className="px-5 py-4">
                            {r.exit === "—" ? (
                              <span className="text-slate-300 text-sm font-medium">
                                —
                              </span>
                            ) : (
                              <Badge className="bg-rose-500 text-white border-0 hover:bg-rose-600 font-bold text-sm px-3 py-1.5 rounded-xl shadow-sm shadow-rose-200 gap-1.5">
                                <span className="text-base">↓</span> {r.exit}
                              </Badge>
                            )}
                          </TableCell>

                          {/* Break */}
                          <TableCell className="px-5 py-4">
                            {r.breakTime === "—" ? (
                              <span className="text-slate-300 text-sm font-medium">
                                —
                              </span>
                            ) : (
                              <Badge className="bg-amber-500 text-white border-0 hover:bg-amber-600 font-bold text-sm px-3 py-1.5 rounded-xl shadow-sm shadow-amber-200 gap-1.5">
                                ☕ {r.breakTime}h
                              </Badge>
                            )}
                          </TableCell>

                          {/* Work Hours */}
                          <TableCell className="px-5 py-4">
                            <WorkBar hours={r.workHours} />
                          </TableCell>

                          <TableCell className="px-5 py-4">
                            {(() => {
                              const pct = getStatusPercent(r);

                              return (
                                <Badge
                                  className={`border-0 font-bold text-sm px-3 py-1.5 rounded-xl ${
                                    pct >= 80
                                      ? "bg-emerald-500 text-white"
                                      : pct >= 50
                                        ? "bg-amber-500 text-white"
                                        : "bg-rose-500 text-white"
                                  }`}
                                >
                                  {pct}%
                                </Badge>
                              );
                            })()}
                          </TableCell>

                          {/* IP */}
                          <TableCell className="px-5 py-4">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="cursor-pointer space-y-1.5">
                                    <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-2.5 py-1.5">
                                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                                      <span className="text-xs font-semibold text-emerald-700 font-mono">
                                        {r.checkInIp}
                                      </span>
                                    </div>
                                    {r.checkOutIp !== "—" && (
                                      <div className="flex items-center gap-2 bg-rose-50 rounded-xl px-2.5 py-1.5">
                                        <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
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
                          {isAdminView && (
                            <TableCell className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditRecord(r)}
                                  className="rounded-xl border-2 border-slate-200 text-xs font-semibold h-8 px-3"
                                >
                                  ✏️ Edit
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleDeleteRecord(r)}
                                  className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-semibold h-8 px-3"
                                >
                                  🗑️ Delete
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-100">
                  <p className="text-xs text-slate-400 font-medium">
                    Showing {(page - 1) * ROWS_PER_PAGE + 1}–
                    {Math.min(page * ROWS_PER_PAGE, records.length)} of{" "}
                    {records.length} entries
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-xl border-2 border-slate-200 text-xs font-semibold h-8 px-3 disabled:opacity-40"
                    >
                      ← Prev
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (n) => (
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
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
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] border-0 p-0 overflow-hidden gap-0">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-sky-700 px-6 py-6">
            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10" />
            <div className="absolute bottom-0 left-1/3 h-14 w-14 rounded-full bg-white/5" />
            <DialogHeader>
              <div className="relative flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-xl backdrop-blur-sm shadow-lg">
                  ✏️
                </div>
                <div>
                  <DialogTitle className="text-white text-lg font-black tracking-tight">
                    Edit Attendance
                  </DialogTitle>
                  <p className="text-cyan-100 text-xs font-medium mt-0.5">
                    {editingRecord?.date}
                  </p>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <span className="text-emerald-500">↑</span> Entry Time
                </Label>
                <Input
                  type="time"
                  value={editForm.entry}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, entry: e.target.value }))
                  }
                  className="rounded-2xl border-2 border-slate-200 bg-slate-50 focus:border-emerald-400 font-semibold transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <span className="text-rose-500">↓</span> Exit Time
                </Label>
                <Input
                  type="time"
                  value={editForm.exit}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, exit: e.target.value }))
                  }
                  className="rounded-2xl border-2 border-slate-200 bg-slate-50 focus:border-rose-400 font-semibold transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                ☕ Break Time (H:MM)
              </Label>
              <Input
                type="text"
                placeholder="1:00"
                value={editForm.breakTime}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, breakTime: e.target.value }))
                }
                className="rounded-2xl border-2 border-slate-200 bg-slate-50 focus:border-amber-400 font-semibold transition-all"
              />
              <p className="text-[11px] text-slate-400 pl-1">
                Format: hours:minutes, e.g. 1:15 for 1 hr 15 mins
              </p>
            </div>

            {/* Live preview */}
            {editForm.entry && editForm.exit && (
              <div className="rounded-2xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 px-4 py-3 flex items-center justify-between">
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wide">
                  Preview
                </span>
                <span className="text-sm font-black text-teal-700">
                  {convertTo12Hr(editForm.entry)} →{" "}
                  {convertTo12Hr(editForm.exit)}
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 pb-6 gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              disabled={saving}
              className="rounded-2xl flex-1 font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving}
              className="rounded-2xl flex-1 font-bold bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700"
            >
              {saving ? "Saving..." : "💾 Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
