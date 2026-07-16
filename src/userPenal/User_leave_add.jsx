import { useState, useEffect } from "react";
import User_Sidebar from "./User_Sidebar";
import axios from "axios";

import { useTheme } from "../Theme/ThemeContext";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ── shadcn: Card ──
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// ── shadcn: Badge ──
import { Badge } from "@/components/ui/badge";
// ── shadcn: Button ──
import { Button } from "@/components/ui/button";
// ── shadcn: Input ──
import { Input } from "@/components/ui/input";
// ── shadcn: Label ──
import { Label } from "@/components/ui/label";
// ── shadcn: Textarea ──
import { Textarea } from "@/components/ui/textarea";
// ── shadcn: Alert ──
import { Alert, AlertDescription } from "@/components/ui/alert";
// ── shadcn: Dialog ──
import { Dialog, DialogContent } from "@/components/ui/dialog";
// ── shadcn: Tooltip ──
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// ── shadcn: Table ──
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
// ── shadcn: Tabs ──
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// ── shadcn: Separator ──
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner"; // ❌ missing
// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────
const LEAVE_TYPES = [
  "Casual Leave",
  "Sick Leave",
  "Earned Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Unpaid Leave",
];

/*const LEAVE_BALANCE = [
  { label: "Casual", total: 12, used: 2, color: "indigo", icon: "🏖️" },
  { label: "Sick", total: 8, used: 1, color: "rose", icon: "🤒" },
  { label: "Earned", total: 15, used: 3, color: "emerald", icon: "⭐" },
  { label: "Unpaid", total: 30, used: 0, color: "amber", icon: "📋" },
];

const SAMPLE_HISTORY = [
  {
    id: 1,
    type: "Casual Leave",
    from: "05-05-2026",
    to: "06-05-2026",
    days: 2,
    reason: "Personal Work",
    status: "Approved",
    appliedOn: "02-05-2026",
  },
  {
    id: 2,
    type: "Sick Leave",
    from: "15-05-2026",
    to: "15-05-2026",
    days: 1,
    reason: "Fever",
    status: "Approved",
    appliedOn: "14-05-2026",
  },
  {
    id: 3,
    type: "Paid Leave",
    from: "25-05-2026",
    to: "26-05-2026",
    days: 2,
    reason: "Family Function",
    status: "Pending",
    appliedOn: "22-05-2026",
  },
];*/

const COLORS = {
  indigo: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-600",
    bar: "bg-indigo-500",
    badge: "bg-indigo-100 text-indigo-700",
    glow: "shadow-indigo-100",
  },
  rose: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-600",
    bar: "bg-rose-500",
    badge: "bg-rose-100 text-rose-700",
    glow: "shadow-rose-100",
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-600",
    bar: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
    glow: "shadow-emerald-100",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-600",
    bar: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
    glow: "shadow-amber-100",
  },
};

const STATUS_CONFIG = {
  Approved: {
    style: "bg-emerald-600 text-emerald-500 border border-emerald-200",
    icon: "✓",
    dot: "bg-emerald-500",
    tip: "Approved by HR",
  },
  Rejected: {
    style: "bg-rose-600 text-rose-500 border border-rose-200",
    icon: "✕",
    dot: "bg-rose-500",
    tip: "Rejected by HR",
  },
  Pending: {
    style: "bg-amber-600 text-amber-500 border border-amber-200",
    icon: "⏳",
    dot: "bg-amber-400",
    tip: "Awaiting HR approval",
  },
};

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function calcDays(from, to) {
  if (!from || !to) return 0;

  // Helper to parse date in either DD-MM-YYYY or YYYY-MM-DD
  const parseDate = (dateStr) => {
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      // Check if it's YYYY-MM-DD (first part is 4 digits)
      if (parts[0].length === 4) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }
      // Otherwise it's DD-MM-YYYY
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return new Date(dateStr);
  };

  const fromDate = parseDate(from);
  const toDate = parseDate(to);

  return Math.max(1, Math.round((toDate - fromDate) / 86400000) + 1);
}
function useLeave() {
  const [history, setHistory] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  function getHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // uplaod csv and pdf on google drive ........

  async function fetchAll() {
    setLoading(true);
    try {
      const [h, b] = await Promise.all([
        axios.get("http://localhost:5000/leave/history", {
          headers: getHeaders(),
        }),
        axios.get("http://localhost:5000/leave/balance", {
          headers: getHeaders(),
        }),
      ]);

      setHistory(h.data);
      setBalance(b.data);
    } catch (err) {
      showAlert("error", "Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  async function submitLeave(data) {
    try {
      const res = await axios.post("http://localhost:5000/leave/apply", data, {
        headers: getHeaders(),
      });

      // refresh instead of manually pushing
      await fetchAll();

      showAlert("success", "Leave applied!");
      return true;
    } catch (err) {
      showAlert("error", "Failed.");
      return false;
    }
  }

  function showAlert(type, msg) {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  }

  return { history, balance, loading, alert, submitLeave, fetchAll };
}

// ─────────────────────────────────────────────────────────────────
// Leave Balance Card
// ─────────────────────────────────────────────────────────────────
function BalanceCard({ label, total, used, color, icon }) {
  const c = COLORS[color];
  const left = total - used;
  const pct = Math.round((used / total) * 100);
  //  theme change var

  return (
    // ── shadcn Card ──
    <Card
      className={`rounded-3xl border-2 ${c.border} ${c.bg} shadow-lg ${c.glow} hover:scale-[1.02] transition-transform duration-200`}
    >
      <CardContent className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              {label}
            </p>
            <p className={`text-4xl font-black mt-1 ${c.text}`}>{left}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {used} used · {total} total
            </p>
          </div>
          {/* Icon bubble */}
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${c.badge} text-xl`}
          >
            {icon}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-white/80 overflow-hidden">
          <div
            className={`h-2 rounded-full ${c.bar} transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {/* ── shadcn Badge ── */}
        <div className="mt-2 flex justify-end">
          <Badge
            className={`${c.badge} border-0 text-[10px] font-bold hover:opacity-90`}
          >
            {left} days left
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────
// History Table Row
// ─────────────────────────────────────────────────────────────────
function HistoryRow({ leave, index }) {
  const s = STATUS_CONFIG[leave.status];
  return (
    <TableRow className="border-b border-slate-100 hover:bg-indigo-50 transition-all duration-300 cursor-pointer">
      {/* # */}
      <TableCell className="px-4 py-3.5 text-sm text-slate-400 font-medium w-10">
        {index + 1}
      </TableCell>
      {/* Type */}
      <TableCell className="px-4 py-3.5">
        <span className="text-sm font-semibold text-slate-700">
          {leave.type}
        </span>
      </TableCell>
      {/* From */}
      <TableCell className="px-4 py-3.5 text-sm text-slate-500">
        {leave.from}
      </TableCell>
      {/* To */}
      <TableCell className="px-4 py-3.5 text-sm text-slate-500">
        {leave.to}
      </TableCell>
      {/* Days — shadcn Badge */}
      <TableCell className="px-4 py-3.5">
        {/* ── shadcn Badge ── */}
        <Badge className="bg-indigo-400 text-indigo-700 border-0 hover:bg-indigo-100 font-bold text-xs px-2.5">
          {leave.days}
        </Badge>
      </TableCell>
      {/* Applied On */}
      <TableCell className="px-4 py-3.5 text-sm text-slate-500">
        {leave.appliedOn}
      </TableCell>
      {/* Reason */}
      <TableCell className="px-4 py-3.5 text-sm text-slate-500 max-w-[150px] truncate">
        {leave.reason}
      </TableCell>
      {/* Status — shadcn Tooltip + Badge */}
      <TableCell className="px-4 py-3.5">
        {/* ── shadcn Tooltip ── */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {/* ── shadcn Badge ── */}
              <Badge
                className={`px-4 py-1 rounded-full text-xs font-bold tracking-wide cursor-default flex items-center gap-2 w-fit transition-all duration-300 hover:scale-105 ${s.style}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${s.dot} animate-pulse`}
                />
                {leave.status}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="text-xs">{s.tip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  );
}

const uploadToDrive = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    await axios.post(
      "http://localhost:5000/api/google-drive/upload-drive",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  } catch (err) {
    console.error("Upload failed", err);
  }
};
// ─────────────────────────────────────────────────────────────────
// Export Functions
// ─────────────────────────────────────────────────────────────────
const handleExportCSV = async (history) => {
  const BOM = "\uFEFF";

  const formattedData = history.map((leave) => ({
    "Leave Type": leave.type,
    "From Date": leave.from,
    "To Date": leave.to,
    Days: leave.days,
    Status: leave.status,
    "Applied On": leave.appliedOn,
    Reason: leave.reason,
  }));

  const csv = Papa.unparse(formattedData);
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });

  const file = new File([blob], "Leave_Report.csv", {
    type: "text/csv",
  });

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

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Leave_Report.csv";
  link.click();
  URL.revokeObjectURL(url);
};
async function handleExportPDF(history) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const marginLeft = 14;
  const currentDate = new Date();
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
  const reportDate = `${currentDate.getDate().toString().padStart(2, "0")}-${monthNames[currentDate.getMonth()].substring(0, 3)}-${currentDate.getFullYear()}`;
  const reportTime = currentDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // --- Company Header ---
  doc.setFillColor(20, 50, 100);
  doc.rect(0, 0, pageWidth, 50, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("ABC TECHNOLOGIES PVT. LTD.", pageWidth / 2, 25, {
    align: "center",
  });
  doc.setFontSize(14);
  doc.text("Leave Management Report", pageWidth / 2, 40, { align: "center" });

  // --- Employee Info ---
  const infoBoxY = 55;
  doc.setFillColor(245, 248, 255);
  doc.rect(marginLeft, infoBoxY, pageWidth - marginLeft * 2, 90, "F");
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(marginLeft, infoBoxY, pageWidth - marginLeft * 2, 90);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20, 50, 100);
  doc.text("Employee Information", marginLeft + 12, infoBoxY + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);

  // Left column
  doc.text("Employee ID:", marginLeft + 12, infoBoxY + 32);
  doc.setFont("helvetica", "bold");
  doc.text("EMP001", marginLeft + 55, infoBoxY + 32);
  doc.setFont("helvetica", "normal");

  doc.text("Employee Name:", marginLeft + 12, infoBoxY + 47);
  doc.setFont("helvetica", "bold");
  doc.text("Prakash Odedra", marginLeft + 55, infoBoxY + 47);
  doc.setFont("helvetica", "normal");

  doc.text("Department:", marginLeft + 12, infoBoxY + 62);
  doc.setFont("helvetica", "bold");
  doc.text("IT", marginLeft + 55, infoBoxY + 62);
  doc.setFont("helvetica", "normal");

  doc.text("Designation:", marginLeft + 12, infoBoxY + 77);
  doc.setFont("helvetica", "bold");
  doc.text("MERN Developer", marginLeft + 55, infoBoxY + 77);
  doc.setFont("helvetica", "normal");

  // Right column
  doc.text("Report Period:", pageWidth / 2, infoBoxY + 32);
  doc.setFont("helvetica", "bold");
  doc.text("Jan 2026 - Dec 2026", pageWidth / 2 + 55, infoBoxY + 32);
  doc.setFont("helvetica", "normal");

  doc.text("Generated On:", pageWidth / 2, infoBoxY + 47);
  doc.setFont("helvetica", "bold");
  doc.text(reportDate, pageWidth / 2 + 55, infoBoxY + 47);
  doc.setFont("helvetica", "normal");

  // --- Leave Summary ---
  const summaryY = infoBoxY + 100;
  doc.setFillColor(20, 50, 100);
  doc.rect(marginLeft, summaryY, pageWidth - marginLeft * 2, 12, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("LEAVE SUMMARY", pageWidth / 2, summaryY + 8, { align: "center" });

  // Create summary table
  const summaryTableY = summaryY + 15;
  const summaryTableData = [
    [
      {
        content: "Total Leave Balance:",
        styles: { fontStyle: "bold", textColor: [20, 50, 100] },
      },
      { content: "20", styles: { textColor: [34, 197, 94] } },
      {
        content: "Leaves Used:",
        styles: { fontStyle: "bold", textColor: [20, 50, 100] },
      },
      { content: "8", styles: { textColor: [245, 158, 11] } },
      {
        content: "Remaining Leaves:",
        styles: { fontStyle: "bold", textColor: [20, 50, 100] },
      },
      { content: "12", styles: { textColor: [34, 197, 94] } },
      { content: "", styles: { textColor: [0, 0, 0] } },
      { content: "", styles: { textColor: [0, 0, 0] } },
    ],
    [
      {
        content: "Casual Leave Used:",
        styles: { fontStyle: "bold", textColor: [20, 50, 100] },
      },
      { content: "4", styles: { textColor: [50, 50, 50] } },
      {
        content: "Sick Leave Used:",
        styles: { fontStyle: "bold", textColor: [20, 50, 100] },
      },
      { content: "2", styles: { textColor: [50, 50, 50] } },
      {
        content: "Paid Leave Used:",
        styles: { fontStyle: "bold", textColor: [20, 50, 100] },
      },
      { content: "2", styles: { textColor: [50, 50, 50] } },
      { content: "", styles: { textColor: [0, 0, 0] } },
      { content: "", styles: { textColor: [0, 0, 0] } },
    ],
    [
      {
        content: "Pending Requests:",
        styles: { fontStyle: "bold", textColor: [20, 50, 100] },
      },
      { content: "1", styles: { textColor: [245, 158, 11] } },
      {
        content: "Rejected Requests:",
        styles: { fontStyle: "bold", textColor: [20, 50, 100] },
      },
      { content: "0", styles: { textColor: [239, 68, 68] } },
      { content: "", styles: { textColor: [0, 0, 0] } },
      { content: "", styles: { textColor: [0, 0, 0] } },
      { content: "", styles: { textColor: [0, 0, 0] } },
      { content: "", styles: { textColor: [0, 0, 0] } },
    ],
  ];

  autoTable(doc, {
    body: summaryTableData,
    startY: summaryTableY,
    theme: "plain",
    margin: { left: marginLeft, right: marginLeft },
    styles: {
      fontSize: 11,
      cellPadding: 4,
      halign: "left",
      fillColor: [245, 248, 255],
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 12 },
      2: { cellWidth: 35 },
      3: { cellWidth: 12 },
      4: { cellWidth: 35 },
      5: { cellWidth: 12 },
    },
  });

  // --- Leave Details ---
  const tableY = doc.lastAutoTable.finalY + 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20, 50, 100);
  doc.text("Leave Details", marginLeft, tableY + 5);

  const tableData = history.map((leave) => [
    leave.type,
    leave.from,
    leave.to,
    leave.days,
    leave.status,
    leave.appliedOn,
    leave.reason,
  ]);

  autoTable(doc, {
    head: [
      [
        "Leave Type",
        "From Date",
        "To Date",
        "Days",
        "Status",
        "Applied On",
        "Reason",
      ],
    ],
    body: tableData,
    startY: tableY + 12,
    theme: "grid",
    headStyles: {
      fillColor: [20, 50, 100],
      textColor: 255,
      fontSize: 10,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 28 },
      2: { cellWidth: 28 },
      3: { cellWidth: 18 },
      4: { cellWidth: 25 },
      5: { cellWidth: 28 },
      6: { cellWidth: 35 },
    },
  });

  // 🔥 STEP 3: Upload to Google Drive
  const pdfBlob = doc.output("blob");

  // 2. create file FIRST
  const file = new File([pdfBlob], "Leave_Report.pdf", {
    type: "application/pdf",
  });

  // 3. download
  doc.save("Leave_Report.pdf");

  // 4. upload AFTER
  await uploadToDrive(file);
  toast.custom(() => (
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
  ));

  // --- Footer ---

  // --- Footer ---
  const finalY = doc.lastAutoTable?.finalY || 200;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Generated By : Leave Management System", marginLeft, finalY + 15);
  doc.text(
    `Generated On : ${reportDate} ${reportTime}`,
    marginLeft,
    finalY + 23,
  );

  // STEP 1: download first (important)
  // 1. generate pdf
  // 1. generate pdf blob
}

// ─────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────
export default function User_leave_add() {
  const [form, setForm] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });
  //const [history, setHistory] = useState(SAMPLE_HISTORY);
  //const [alert, setAlert] = useState(null);
  const { history, balance, loading, alert, submitLeave } = useLeave();
  const [submitting, setSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function resetForm() {
    setForm({ leaveType: "", fromDate: "", toDate: "", reason: "" });
  }

  // Helper to format date as DD-MM-YYYY
  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  /*function handleSubmit(e) {
    e.preventDefault();
    if (!form.leaveType || !form.fromDate || !form.toDate || !form.reason) {
      setAlert({
        type: "error",
        msg: "Please fill all fields before submitting.",
      });
      setTimeout(() => setAlert(null), 4000);
      return;
    }
    const today = new Date();
    const appliedOn = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
    setHistory([
      {
        id: Date.now(),
        type: form.leaveType,
        from: formatDate(form.fromDate),
        to: formatDate(form.toDate),
        days: calcDays(form.fromDate, form.toDate),
        reason: form.reason,
        status: "Pending",
        appliedOn: appliedOn,
      },
      ...history,
    ]);
    resetForm();
    setAlert({
      type: "success",
      msg: "Leave applied! Waiting for HR approval.",
    });
    setTimeout(() => setAlert(null), 4000);
  }*/

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.leaveType || !form.fromDate || !form.toDate || !form.reason)
      return;
    setSubmitting(true);
    const success = await submitLeave({
      leaveType: form.leaveType,
      from: form.fromDate,
      to: form.toDate,
      days: calcDays(form.fromDate, form.toDate),
      reason: form.reason,
    });
    setSubmitting(false);
    if (success) resetForm();
  }

  function filteredHistory(tab) {
    if (tab === "all") return history;

    // If the tab is "approval", show items where status is "Pending"
    if (tab === "approval") {
      return history.filter((l) => l.status.toLowerCase() === "pending");
    }

    // Otherwise, filter by the tab name normally
    return history.filter((l) => l.status.toLowerCase() === tab);
  }

  // Count per tab for badge
  const counts = {
    all: history.length,
    pending: history.filter((l) => l.status?.trim().toLowerCase() === "pending")
      .length,
    approved: history.filter(
      (l) => l.status?.trim().toLowerCase() === "approved",
    ).length,
    rejected: history.filter(
      (l) => l.status?.trim().toLowerCase() === "rejected",
    ).length,
  };

  const leaveCardConfig = {
    casual: { label: "Casual", total: 12, color: "indigo", icon: "🏖️" },
    sick: { label: "Sick", total: 8, color: "rose", icon: "🤒" },
    earned: { label: "Earned", total: 15, color: "emerald", icon: "⭐" },
    unpaid: { label: "Unpaid", total: 30, color: "amber", icon: "📋" },
  };

  const normalizeLeaveType = (type = "") =>
    type.toLowerCase().replace(" leave", "").trim();

  const leaveSummary = Object.entries(leaveCardConfig).map(([key, config]) => {
    const used = history
      .filter((leave) => normalizeLeaveType(leave.type) === key)
      .reduce((total, leave) => total + Number(leave.days || 0), 0);

    return {
      ...config,
      key,
      used,
      total: balance?.[key]?.total ?? config.total,
    };
  });
  return (
    <div className=" card flex min-h-screen flex flex-col md:flex-row** min-h-screen bg-slate-50">
      {/* Sidebar */}
      <User_Sidebar />

      <div className="flex-1 md:ml-72">
        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 py-8 pt-20 md:pt-8">
          {/* decorative circles */}
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/5" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-xl backdrop-blur-sm">
                🗓️
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Leave Management
              </h1>
            </div>
            <p className="text-indigo-200 text-sm ml-13 pl-0.5">
              Apply, track and manage your leave requests
            </p>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-32 rounded-3xl bg-slate-100 animate-pulse"
                  />
                ))
              : leaveSummary.map((item) => (
                  <BalanceCard
                    key={item.key}
                    label={item.label}
                    color={item.color}
                    icon={item.icon}
                    total={item.total}
                    used={item.used}
                  />
                ))}
          </div>

          {/* ── Apply Form Card ── */}
          {/* ── shadcn Card ── */}
          <Card className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-2xl overflow-hidden">
            {/* Colored top strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

            {/* ── shadcn CardHeader ── */}
            <CardHeader className="px-6 py-5 border-b bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">
              <CardTitle className="flex items-center gap-3 text-base font-bold text-slate-800">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-100 text-lg">
                  📝
                </span>
                Apply for Leave
              </CardTitle>
            </CardHeader>

            {/* ── shadcn CardContent ── */}
            <CardContent className="p-6 bg-white">
              {/* ── shadcn Alert ── */}
              {alert && (
                <Alert
                  className={`mb-5 rounded-2xl border-0 ${alert.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                >
                  <AlertDescription className="text-sm font-semibold">
                    {alert.type === "success" ? "✅ " : "❌ "}
                    {alert.msg}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row 1 — Leave Type + Total Days */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    {/* ── shadcn Label ── */}
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Leave Type
                    </Label>
                    <select
                      name="leaveType"
                      value={form.leaveType}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:border-indigo-400 focus:bg-white transition-all"
                    >
                      <option value="">Select leave type...</option>
                      {LEAVE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    {/* ── shadcn Label ── */}
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Total Days
                    </Label>
                    {/* ── shadcn Input (read-only) ── */}
                    <Input
                      readOnly
                      value={
                        form.fromDate && form.toDate
                          ? `${calcDays(form.fromDate, form.toDate)} day(s)`
                          : ""
                      }
                      placeholder="Auto calculated"
                      className="rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>

                {/* ── shadcn Separator ── */}
                <Separator />

                {/* Row 2 — From + To Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    {/* ── shadcn Label ── */}
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      From Date
                    </Label>
                    {/* ── shadcn Input ── */}
                    <Input
                      type="date"
                      name="fromDate"
                      value={form.fromDate}
                      onChange={handleChange}
                      className="rounded-2xl border-2 border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    {/* ── shadcn Label ── */}
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      To Date
                    </Label>
                    {/* ── shadcn Input ── */}
                    <Input
                      type="date"
                      name="toDate"
                      value={form.toDate}
                      min={form.fromDate}
                      onChange={handleChange}
                      className="rounded-2xl border-2 border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  {/* ── shadcn Label ── */}
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Reason for Leave
                  </Label>
                  {/* ── shadcn Textarea ── */}
                  <Textarea
                    name="reason"
                    value={form.reason}
                    onChange={handleChange}
                    placeholder="Briefly describe your reason..."
                    rows={3}
                    className="rounded-2xl border-2 border-slate-200 bg-slate-50 resize-none focus:border-indigo-400 focus:bg-white transition-all font-medium"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  {/* ── shadcn Button (outline) ── */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCancelDialog(true)}
                    className="rounded-2xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold px-5"
                  >
                    Cancel
                  </Button>
                  {/* ── shadcn Button ── */}
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold px-6 shadow-lg shadow-indigo-200"
                  >
                    {submitting ? "Submitting..." : "🗓️ Apply Leave"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* ── Leave History Card ── */}
          {/* ── shadcn Card ── */}
          <Card className="rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-2xl shadow-indigo-100/40">
            {/* Colored top strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />

            {/* ── shadcn CardHeader ── */}
            <CardHeader className="px-8 py-6 bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-900 flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-white">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-md">
                  📋
                </span>
                Leave History
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleExportCSV(history)}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg px-5"
                >
                  📊 Export CSV
                </Button>
                <Button
                  onClick={() => handleExportPDF(history)}
                  className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-lg px-5"
                >
                  📄 Export PDF
                </Button>
              </div>
              {/* ── shadcn Badge ── */}
            </CardHeader>

            {/* ── shadcn CardContent ── */}
            <CardContent className="p-0 bg-white">
              {/* ── shadcn Tabs ── */}
              <Tabs defaultValue="all" className="flex flex-col w-full">
                {/* ── shadcn TabsList ── */}
                <TabsList className="flex w-full bg-slate-100 h-14 p-2 gap-2 rounded-none">
                  {["all", "pending", "approved", "rejected"].map((t) => {
                    const dotColor = {
                      all: "bg-slate-400",
                      pending: "bg-amber-400",
                      approved: "bg-emerald-500",
                      rejected: "bg-rose-500",
                    };
                    return (
                      <TabsTrigger
                        key={t}
                        value={t}
                        className="flex-1 rounded-xl font-semibold text-slate-600 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all duration-300"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${dotColor[t]}`}
                        />
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                        {/* count bubble */}
                        <span className="ml-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-600">
                          {counts[t]}
                        </span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {/* Tab contents */}
                {["all", "pending", "approved", "rejected"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-0 w-full">
                    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200">
                      <Table className="w-full">
                        <TableHeader className="bg-slate-900">
                          <TableRow className="border-b border-slate-700">
                            {[
                              "#",
                              "Type",
                              "From",
                              "To",
                              "Days",
                              "Applied",
                              "Reason",
                              "Status",
                            ].map((h) => (
                              <TableHead
                                key={h}
                                className="px-6 py-4 text-white font-bold uppercase tracking-wider text-sm"
                              >
                                {h}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredHistory(tab).length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={8}
                                className="text-center py-16 text-slate-400"
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <span className="text-6xl">📂</span>
                                  <p className="text-sm font-medium">
                                    No {tab === "all" ? "" : tab} records found
                                  </p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredHistory(tab).map((leave, i) => (
                              <HistoryRow
                                key={leave.id}
                                leave={leave}
                                index={i}
                              />
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── shadcn Dialog — Discard confirmation ── */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="rounded-3xl max-w-sm border-0 shadow-2xl p-0 overflow-hidden">
          {/* top strip */}
          <div className="h-1.5 bg-gradient-to-r from-rose-500 to-pink-500" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-xl">
                🗑️
              </div>
              <h2 className="text-base font-bold text-slate-800">
                Discard Changes?
              </h2>
            </div>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              All entered data will be cleared. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              {/* ── shadcn Button (outline) ── */}
              <Button
                variant="outline"
                className="flex-1 rounded-2xl border-2 font-semibold"
                onClick={() => setShowCancelDialog(false)}
              >
                Keep Editing
              </Button>
              {/* ── shadcn Button (destructive) ── */}
              <Button
                variant="destructive"
                className="flex-1 rounded-2xl font-semibold"
                onClick={() => {
                  resetForm();
                  setShowCancelDialog(false);
                }}
              >
                Yes, Discard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
