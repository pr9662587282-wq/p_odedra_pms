import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Sidebar_Admin from "./Sidebar_Admin";

// ── Status config ─────────────────────────────────────────────────
const STATUS_CONFIG = {
  Approved: {
    style: "bg-emerald-600 text-emerald-400 border border-emerald-400",
    dot: "bg-emerald-500",
    tip: "Approved by Admin",
  },
  Rejected: {
    style: "bg-rose-500 text-rose-400 border border-rose-300",
    dot: "bg-rose-500",
    tip: "Rejected by Admin",
  },
  Pending: {
    style: "bg-amber-50 text-amber-700 border border-amber-300",
    dot: "bg-amber-500",
    tip: "Awaiting approval",
  },
};

// ── API helpers ───────────────────────────────────────────────────
function getHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Stat Card ─────────────────────────────────────────────────────
function StatCard({ label, value, gradient, icon }) {
  return (
    <Card
      className={`rounded-3xl border-0 shadow-lg overflow-hidden ${gradient}`}
    >
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest">
            {label}
          </p>
          <p className="text-4xl font-black mt-1 text-white">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl bg-white/20 backdrop-blur-sm">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Admin Panel ──────────────────────────────────────────────
export default function Admin_Leave_Panel() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [alert, setAlert] = useState(null);
  const [editLeave, setEditLeave] = useState(null);
  const [editForm, setEditForm] = useState({ from: "", to: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  async function fetchLeaves() {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/leave/admin/all", {
        headers: getHeaders(),
      });
      setLeaves(res.data);
    } catch (err) {
      showAlert("error", "Failed to load leaves.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id, status) {
    setActionId(id);
    try {
      await axios.patch(
        `http://localhost:5000/leave/admin/${id}/status`,
        { status },
        { headers: getHeaders() },
      );
      await fetchLeaves();
      showAlert("success", `Leave ${status} successfully!`);
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Action failed.");
    } finally {
      setActionId(null);
      setConfirm(null);
    }
  }

  function showAlert(type, msg) {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  }

  function openEdit(leave) {
    setEditLeave(leave);
    setEditForm({
      from: toInputDate(leave.from),
      to: toInputDate(leave.to),
    });
  }

  function toInputDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  async function handleSaveEdit() {
    if (!editLeave) return;
    if (!editForm.from || !editForm.to) {
      showAlert("error", "Both From and To dates are required.");
      return;
    }
    if (new Date(editForm.to) < new Date(editForm.from)) {
      showAlert("error", "To date cannot be before From date.");
      return;
    }

    setSaving(true);
    try {
      await axios.patch(
        `http://localhost:5000/leave/admin/${editLeave.id}/dates`,
        { from: editForm.from, to: editForm.to },
        { headers: getHeaders() },
      );
      await fetchLeaves();
      showAlert("success", "Leave dates updated successfully!");
      setEditLeave(null);
    } catch (err) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to update leave dates.",
      );
    } finally {
      setSaving(false);
    }
  }

  function filtered(tab) {
    return tab === "all"
      ? leaves
      : leaves.filter((l) => l.status.toLowerCase() === tab);
  }

  const counts = {
    all: leaves.length,
    pending: leaves.filter((l) => l.status === "Pending").length,
    approved: leaves.filter((l) => l.status === "Approved").length,
    rejected: leaves.filter((l) => l.status === "Rejected").length,
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar_Admin />

      <div className="md:ml-72">
        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-10">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/5" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 border border-white/10 text-xl">
                🛡️
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Admin — Leave Management
              </h1>
            </div>
            <p className="text-slate-300 text-sm mt-1 ml-14">
              Review, approve or reject employee leave requests
            </p>
          </div>
        </div>

        <div className="w-full px-6 md:px-8 py-6 space-y-6">
          {/* ── Alert ── */}
          {alert && (
            <div
              className={`rounded-2xl px-5 py-3 text-sm font-bold shadow-sm ${
                alert.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                  : "bg-rose-50 text-rose-800 border border-rose-300"
              }`}
            >
              {alert.type === "success" ? "✅ " : "❌ "}
              {alert.msg}
            </div>
          )}

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Requests"
              value={counts.all}
              gradient="bg-gradient-to-br from-indigo-500 to-blue-600"
              icon="📋"
            />
            <StatCard
              label="Pending"
              value={counts.pending}
              gradient="bg-gradient-to-br from-amber-500 to-orange-500"
              icon="⏳"
            />
            <StatCard
              label="Approved"
              value={counts.approved}
              gradient="bg-gradient-to-br from-emerald-500 to-green-600"
              icon="✅"
            />
            <StatCard
              label="Rejected"
              value={counts.rejected}
              gradient="bg-gradient-to-br from-rose-500 to-red-600"
              icon="❌"
            />
          </div>

          {/* ── Leave Table Card ── */}
          <Card className="rounded-3xl border-0 shadow-xl shadow-slate-300/40 overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800" />

            <CardHeader className="px-6 py-5 border-b border-slate-200 bg-white flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-3 text-base font-black text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white text-lg">
                  📋
                </span>
                All Leave Requests
              </CardTitle>
              <Button
                onClick={fetchLeaves}
                variant="outline"
                className="rounded-2xl border-2 border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50"
              >
                🔄 Refresh
              </Button>
            </CardHeader>

            <CardContent className="p-0 bg-white">
              <Tabs defaultValue="all" className="flex flex-col w-full">
                {/* Tab triggers */}
                <TabsList className="flex w-full rounded-none border-b border-slate-200 bg-slate-50 h-12 p-1 gap-1 shrink-0">
                  {["all", "pending", "approved", "rejected"].map((t) => {
                    const dotColor = {
                      all: "bg-slate-500",
                      pending: "bg-amber-500",
                      approved: "bg-emerald-500",
                      rejected: "bg-rose-500",
                    };
                    return (
                      <TabsTrigger
                        key={t}
                        value={t}
                        className="flex-1 h-full rounded-xl text-xs font-bold capitalize text-slate-500
                                   flex items-center justify-center gap-1.5
                                   data-[state=active]:bg-white data-[state=active]:text-slate-900
                                   data-[state=active]:shadow-md"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${dotColor[t]}`}
                        />
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                        <span className="ml-0.5 bg-slate-200 text-slate-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">
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
                          <TableRow className="bg-slate-100 hover:bg-slate-100 border-b-2 border-slate-200">
                            {[
                              "#",
                              "Employee",
                              "Dept",
                              "Leave Type",
                              "From",
                              "To",
                              "Days",
                              "Applied On",
                              "Reason",
                              "Status",
                              "Action",
                            ].map((h) => (
                              <TableHead
                                key={h}
                                className="px-4 py-3.5 text-[11px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap"
                              >
                                {h}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell
                                colSpan={11}
                                className="text-center py-16"
                              >
                                <div className="flex flex-col items-center gap-2 text-slate-500">
                                  <div className="h-6 w-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                  <p className="text-sm font-semibold">
                                    Loading leave requests...
                                  </p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : filtered(tab).length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={11}
                                className="text-center py-16"
                              >
                                <div className="flex flex-col items-center gap-2 text-slate-500">
                                  <span className="text-4xl">📭</span>
                                  <p className="text-sm font-semibold">
                                    No {tab === "all" ? "" : tab} requests
                                  </p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filtered(tab).map((leave, i) => {
                              const s =
                                STATUS_CONFIG[leave.status] ||
                                STATUS_CONFIG.Pending;
                              const isActing = actionId === leave.id;
                              return (
                                <TableRow
                                  key={leave.id}
                                  className="hover:bg-slate-50 transition-colors border-b border-slate-100"
                                >
                                  {/* # */}
                                  <TableCell className="px-4 py-4 text-sm text-slate-500 font-bold">
                                    {i + 1}
                                  </TableCell>

                                  {/* Employee */}
                                  <TableCell className="px-4 py-4 min-w-[160px]">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-black">
                                        {leave.employeeName?.[0]?.toUpperCase() ||
                                          "U"}
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-slate-900">
                                          {leave.employeeName}
                                        </p>
                                        <p className="text-[11px] text-slate-500 font-medium">
                                          {leave.email}
                                        </p>
                                      </div>
                                    </div>
                                  </TableCell>

                                  {/* Dept */}
                                  <TableCell className="px-4 py-4 whitespace-nowrap">
                                    <p className="text-sm font-semibold text-slate-800">
                                      {leave.department}
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                      {leave.designation}
                                    </p>
                                  </TableCell>

                                  {/* Leave Type */}
                                  <TableCell className="px-4 py-4">
                                    <span className="text-sm font-bold text-slate-800 whitespace-nowrap">
                                      {leave.type}
                                    </span>
                                  </TableCell>

                                  {/* From */}
                                  <TableCell className="px-4 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap">
                                    {leave.from}
                                  </TableCell>

                                  {/* To */}
                                  <TableCell className="px-4 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap">
                                    {leave.to}
                                  </TableCell>

                                  {/* Days */}
                                  <TableCell className="px-4 py-4">
                                    <Badge className="bg-indigo-400 text-indigo-100 border border-indigo-200 font-black text-xs px-2.5">
                                      {leave.days}d
                                    </Badge>
                                  </TableCell>

                                  {/* Applied On */}
                                  <TableCell className="px-4 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                                    {leave.appliedOn}
                                  </TableCell>

                                  {/* Reason */}
                                  <TableCell className="px-4 py-4 text-sm font-medium text-slate-700 max-w-[150px] truncate">
                                    {leave.reason}
                                  </TableCell>

                                  {/* Status */}
                                  <TableCell className="px-4 py-4">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Badge
                                            className={`${s.style} text-xs font-bold cursor-default flex items-center gap-1.5 w-fit whitespace-nowrap px-2.5 py-1`}
                                          >
                                            <span
                                              className={`h-1.5 w-1.5 rounded-full ${s.dot} inline-block`}
                                            />
                                            {leave.status}
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent side="left">
                                          <p className="text-xs font-semibold">
                                            {s.tip}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </TableCell>

                                  {/* Action Buttons */}
                                  {/* Action Buttons */}
                                  {/* Action Buttons — stacked vertically, full width */}
                                  <TableCell className="px-4 py-4">
                                    <div className="flex flex-col gap-1.5 min-w-[110px]">
                                      {leave.status === "Pending" ? (
                                        <>
                                          <Button
                                            size="sm"
                                            disabled={isActing}
                                            onClick={() =>
                                              setConfirm({
                                                id: leave.id,
                                                status: "Approved",
                                                name: leave.employeeName,
                                              })
                                            }
                                            className="w-full justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 h-auto shadow-sm"
                                          >
                                            {isActing ? "..." : "✓ Approve"}
                                          </Button>
                                          <Button
                                            size="sm"
                                            disabled={isActing}
                                            onClick={() =>
                                              setConfirm({
                                                id: leave.id,
                                                status: "Rejected",
                                                name: leave.employeeName,
                                              })
                                            }
                                            className="w-full justify-center rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 h-auto shadow-sm"
                                          >
                                            {isActing ? "..." : "✕ Reject"}
                                          </Button>
                                        </>
                                      ) : (
                                        <span className="text-xs text-slate-400 font-semibold italic text-center py-1 border border-dashed border-slate-200 rounded-xl">
                                          No action
                                        </span>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openEdit(leave)}
                                        className="w-full justify-center rounded-xl border-2 border-slate-300 text-slate-700 text-xs font-bold px-3 py-1.5 h-auto"
                                      >
                                        ✏️ Edit
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })
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

      {/* ── Confirm Dialog ── */}
      <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <DialogContent className="rounded-3xl max-w-sm border-0 shadow-2xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {confirm?.status === "Approved" ? "Approve" : "Reject"} Leave
            Request
          </DialogTitle>
          <DialogDescription className="sr-only">
            Confirm leave status change for {confirm?.name}
          </DialogDescription>
          <div
            className={`h-1.5 ${confirm?.status === "Approved" ? "bg-emerald-500" : "bg-rose-500"}`}
          />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xl ${
                  confirm?.status === "Approved"
                    ? "bg-emerald-100"
                    : "bg-rose-100"
                }`}
              >
                {confirm?.status === "Approved" ? "✅" : "❌"}
              </div>
              <h2 className="text-base font-black text-slate-900">
                {confirm?.status === "Approved" ? "Approve" : "Reject"} Leave?
              </h2>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed font-medium">
              Are you sure you want to{" "}
              <span className="font-bold text-slate-900">
                {confirm?.status?.toLowerCase()}
              </span>{" "}
              leave request for{" "}
              <span className="font-bold text-slate-900">{confirm?.name}</span>?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-2xl border-2 border-slate-300 font-bold text-slate-700"
                onClick={() => setConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                className={`flex-1 rounded-2xl font-bold text-white ${
                  confirm?.status === "Approved"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
                onClick={() => handleAction(confirm.id, confirm.status)}
              >
                Yes, {confirm?.status === "Approved" ? "Approve" : "Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit Leave Dates Dialog ── */}
      <Dialog open={!!editLeave} onOpenChange={() => setEditLeave(null)}>
        <DialogContent className="rounded-3xl max-w-sm border-0 shadow-2xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">Edit Leave Dates</DialogTitle>
          <DialogDescription className="sr-only">
            Update the from and to dates for this leave request
          </DialogDescription>
          <div className="h-1.5 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                ✏️
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Edit Leave Dates
                </h2>
                <p className="text-xs text-slate-500 font-semibold">
                  {editLeave?.employeeName}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  From
                </label>
                <input
                  type="date"
                  value={editForm.from}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, from: e.target.value }))
                  }
                  className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold focus:border-slate-400 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  To
                </label>
                <input
                  type="date"
                  value={editForm.to}
                  min={editForm.from}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, to: e.target.value }))
                  }
                  className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold focus:border-slate-400 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                disabled={saving}
                className="flex-1 rounded-2xl border-2 border-slate-300 font-bold text-slate-700"
                onClick={() => setEditLeave(null)}
              >
                Cancel
              </Button>
              <Button
                disabled={saving}
                className="flex-1 rounded-2xl font-bold text-white bg-slate-900 hover:bg-slate-800"
                onClick={handleSaveEdit}
              >
                {saving ? "Saving..." : "💾 Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
