import { useState } from "react";
import User_Sidebar from "./User_Sidebar";

import { useTheme } from "../Theme/ThemeContext";

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

const LEAVE_BALANCE = [
  { label: "Casual", total: 12, used: 2, color: "indigo", icon: "🏖️" },
  { label: "Sick", total: 8, used: 1, color: "rose", icon: "🤒" },
  { label: "Earned", total: 15, used: 3, color: "emerald", icon: "⭐" },
  { label: "Unpaid", total: 30, used: 0, color: "amber", icon: "📋" },
];

const SAMPLE_HISTORY = [
  {
    id: 1,
    type: "Casual Leave",
    from: "2026-04-10",
    to: "2026-04-11",
    days: 2,
    reason: "Personal work",
    status: "Approved",
  },
  {
    id: 2,
    type: "Sick Leave",
    from: "2026-03-05",
    to: "2026-03-05",
    days: 1,
    reason: "Fever",
    status: "Approved",
  },
  {
    id: 3,
    type: "Earned Leave",
    from: "2026-02-20",
    to: "2026-02-22",
    days: 3,
    reason: "Family function",
    status: "Rejected",
  },
  {
    id: 4,
    type: "Casual Leave",
    from: "2026-05-15",
    to: "2026-05-16",
    days: 2,
    reason: "Travel",
    status: "Pending",
  },
];

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
    style: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    icon: "✓",
    dot: "bg-emerald-500",
    tip: "Approved by HR",
  },
  Rejected: {
    style: "bg-rose-100 text-rose-700 border border-rose-200",
    icon: "✕",
    dot: "bg-rose-500",
    tip: "Rejected by HR",
  },
  Pending: {
    style: "bg-amber-100 text-amber-700 border border-amber-200",
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
  return Math.max(
    1,
    Math.round((new Date(to) - new Date(from)) / 86400000) + 1,
  );
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
    <TableRow className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
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
        <Badge className="bg-indigo-100 text-indigo-700 border-0 hover:bg-indigo-100 font-bold text-xs px-2.5">
          {leave.days}d
        </Badge>
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
                className={`${s.style} text-xs font-semibold cursor-default flex items-center gap-1.5 w-fit`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${s.dot} inline-block`}
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
  const [history, setHistory] = useState(SAMPLE_HISTORY);
  const [alert, setAlert] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function resetForm() {
    setForm({ leaveType: "", fromDate: "", toDate: "", reason: "" });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.leaveType || !form.fromDate || !form.toDate || !form.reason) {
      setAlert({
        type: "error",
        msg: "Please fill all fields before submitting.",
      });
      setTimeout(() => setAlert(null), 4000);
      return;
    }
    setHistory([
      {
        id: Date.now(),
        type: form.leaveType,
        from: form.fromDate,
        to: form.toDate,
        days: calcDays(form.fromDate, form.toDate),
        reason: form.reason,
        status: "Pending",
      },
      ...history,
    ]);
    resetForm();
    setAlert({
      type: "success",
      msg: "Leave applied! Waiting for HR approval.",
    });
    setTimeout(() => setAlert(null), 4000);
  }

  function filteredHistory(tab) {
    return tab === "all"
      ? history
      : history.filter((l) => l.status.toLowerCase() === tab);
  }

  // Count per tab for badge
  const counts = {
    all: history.length,
    pending: history.filter((l) => l.status === "Pending").length,
    approved: history.filter((l) => l.status === "Approved").length,
    rejected: history.filter((l) => l.status === "Rejected").length,
  };

  return (
    <div className=" card flex min-h-screen">
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
          {/* ── Balance Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {LEAVE_BALANCE.map((b) => (
              <BalanceCard key={b.label} {...b} />
            ))}
          </div>

          {/* ── Apply Form Card ── */}
          {/* ── shadcn Card ── */}
          <Card className="rounded-3xl border-0 shadow-xl shadow-slate-200/60 overflow-hidden">
            {/* Colored top strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

            {/* ── shadcn CardHeader ── */}
            <CardHeader className="px-6 py-5 border-b border-slate-100 bg-white">
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
                    className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold px-6 shadow-lg shadow-indigo-200"
                  >
                    🗓️ Apply Leave
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* ── Leave History Card ── */}
          {/* ── shadcn Card ── */}
          <Card className="rounded-3xl border-0 shadow-xl shadow-slate-200/60 overflow-hidden">
            {/* Colored top strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />

            {/* ── shadcn CardHeader ── */}
            <CardHeader className="px-6 py-5 border-b border-slate-100 bg-white flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-3 text-base font-bold text-slate-800">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-100 text-lg">
                  📋
                </span>
                Leave History
              </CardTitle>
              {/* ── shadcn Badge ── */}
              <Badge className="bg-indigo-100 text-indigo-700 border-0 hover:bg-indigo-100 font-bold text-xs px-3 py-1 rounded-full">
                {history.length} total
              </Badge>
            </CardHeader>

            {/* ── shadcn CardContent ── */}
            <CardContent className="p-0 bg-white">
              {/* ── shadcn Tabs ── */}
              <Tabs defaultValue="all" className="flex flex-col w-full">
                {/* ── shadcn TabsList ── */}
                <TabsList className="flex w-full rounded-none border-b border-slate-100 bg-slate-50/80 h-12 p-1 gap-1 shrink-0">
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
                        className="flex-1 h-full rounded-xl text-xs font-bold capitalize text-slate-400 flex items-center justify-center gap-1.5
                                   data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm data-[state=active]:shadow-slate-200"
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
                    <div className="w-full overflow-x-auto">
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow className="bg-slate-50/60 hover:bg-slate-50 border-b border-slate-100">
                            {[
                              "#",
                              "Leave Type",
                              "From",
                              "To",
                              "Days",
                              "Reason",
                              "Status",
                            ].map((h) => (
                              <TableHead
                                key={h}
                                className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest"
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
                                colSpan={7}
                                className="text-center py-16 text-slate-400"
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <span className="text-4xl">📭</span>
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
