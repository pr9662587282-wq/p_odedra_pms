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
// ── shadcn: Separator ──
import { Separator } from "@/components/ui/separator";
// ── shadcn: Tabs ──
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// ── shadcn: Tooltip ──
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─────────────────────────────────────────────────────────────────
// Static task data — replace with API later:
// useEffect(() => axios.get('/api/tasks').then(r => setTasks(r.data)), [])
// ─────────────────────────────────────────────────────────────────
const ALL_TASKS = [
  {
    id: 1,
    title: "Design Login Page UI",
    project: "HR Portal",
    priority: "High",
    status: "Completed",
    due: "2026-05-10",
    assignedBy: "Rahul Sharma",
    desc: "Create a modern login page with form validation and responsive design.",
  },
  {
    id: 2,
    title: "Build REST API for Attendance",
    project: "HR Portal",
    priority: "High",
    status: "In Progress",
    due: "2026-05-22",
    assignedBy: "Rahul Sharma",
    desc: "Develop Node.js REST endpoints for check-in, check-out and break tracking.",
  },
  {
    id: 3,
    title: "Fix Dashboard Calendar Bug",
    project: "HR Portal",
    priority: "Medium",
    status: "In Progress",
    due: "2026-05-20",
    assignedBy: "Priya Patel",
    desc: "Calendar dates are misaligned on mobile. Fix the react-day-picker grid.",
  },
  {
    id: 4,
    title: "Write Unit Tests for Auth",
    project: "HR Portal",
    priority: "Low",
    status: "Pending",
    due: "2026-05-28",
    assignedBy: "Rahul Sharma",
    desc: "Write Jest unit tests for login, register and forgot password flows.",
  },
  {
    id: 5,
    title: "Deploy to Production Server",
    project: "DevOps",
    priority: "High",
    status: "Pending",
    due: "2026-05-30",
    assignedBy: "Amit Joshi",
    desc: "Deploy the latest build to the production VPS using PM2 and Nginx.",
  },
  {
    id: 6,
    title: "Create Leave Management Module",
    project: "HR Portal",
    priority: "Medium",
    status: "Completed",
    due: "2026-05-15",
    assignedBy: "Priya Patel",
    desc: "Build the full leave apply, history and approval workflow.",
  },
  {
    id: 7,
    title: "Optimize MongoDB Queries",
    project: "Backend",
    priority: "Medium",
    status: "In Progress",
    due: "2026-05-25",
    assignedBy: "Amit Joshi",
    desc: "Add indexes and optimize slow queries in the attendance collection.",
  },
  {
    id: 8,
    title: "Mobile Responsive Fixes",
    project: "HR Portal",
    priority: "High",
    status: "Pending",
    due: "2026-05-21",
    assignedBy: "Rahul Sharma",
    desc: "Fix layout issues on screens below 375px width across all pages.",
  },
  {
    id: 9,
    title: "Setup CI/CD Pipeline",
    project: "DevOps",
    priority: "Low",
    status: "Pending",
    due: "2026-06-05",
    assignedBy: "Amit Joshi",
    desc: "Configure GitHub Actions for automated build and deploy on push.",
  },
  {
    id: 10,
    title: "Profile Page Edit Feature",
    project: "HR Portal",
    priority: "Medium",
    status: "Completed",
    due: "2026-05-12",
    assignedBy: "Priya Patel",
    desc: "Allow users to edit their profile info and upload documents.",
  },
];

// ─────────────────────────────────────────────────────────────────
// Config maps
// ─────────────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  High: {
    badge: "bg-rose-500 text-white",
    dot: "bg-rose-500",
    label: "🔴 High",
  },
  Medium: {
    badge: "bg-amber-500 text-white",
    dot: "bg-amber-400",
    label: "🟡 Medium",
  },
  Low: {
    badge: "bg-emerald-500 text-white",
    dot: "bg-emerald-500",
    label: "🟢 Low",
  },
};

const STATUS_CONFIG = {
  Completed: {
    badge: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    icon: "✅",
    bar: "bg-emerald-500",
    pct: 100,
  },
  "In Progress": {
    badge: "bg-blue-100 text-blue-700 border border-blue-200",
    icon: "🔄",
    bar: "bg-blue-500",
    pct: 55,
  },
  Pending: {
    badge: "bg-slate-100 text-slate-600 border border-slate-200",
    icon: "⏳",
    bar: "bg-slate-300",
    pct: 0,
  },
};

// ─────────────────────────────────────────────────────────────────
// Summary stat card
// ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, gradient, icon, sub }) {
  return (
    // ── shadcn Card ──
    <Card
      className={`rounded-3xl border-0 shadow-lg overflow-hidden ${gradient} hover:scale-[1.02] transition-transform duration-200`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest">
              {label}
            </p>
            <p className="text-4xl font-black text-white mt-1 leading-none">
              {value}
            </p>
            {sub && <p className="text-xs text-white/60 mt-1">{sub}</p>}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-sm shadow">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────
// Task Card — Android-style card for each task
// ─────────────────────────────────────────────────────────────────
function TaskCard({ task }) {
  const [expanded, setExpanded] = useState(false);
  const p = PRIORITY_CONFIG[task.priority];
  const s = STATUS_CONFIG[task.status];

  return (
    // ── shadcn Card ──
    <Card className="rounded-3xl border-0 shadow-md shadow-slate-200/50 overflow-hidden hover:shadow-lg hover:shadow-slate-200/70 transition-all duration-200">
      {/* Priority color strip on left */}
      <div className="flex">
        <div className={`w-1.5 shrink-0 ${p.dot}`} />

        <CardContent className="flex-1 p-0">
          {/* Top section */}
          <div className="p-4 pb-3">
            {/* Row 1: title + priority badge */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-sm font-bold text-slate-800 leading-snug flex-1">
                {task.title}
              </h3>
              {/* ── shadcn Badge (priority) ── */}
              <Badge
                className={`${p.badge} border-0 text-xs font-bold px-2.5 py-1 rounded-xl shrink-0 shadow-sm`}
              >
                {task.priority}
              </Badge>
            </div>

            {/* Row 2: project chip + due date */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-2.5 py-1 rounded-xl border border-indigo-100">
                📁 {task.project}
              </span>
              <span className="bg-slate-50 text-slate-500 text-xs font-medium px-2.5 py-1 rounded-xl border border-slate-100">
                📅 {task.due}
              </span>
              <span className="bg-violet-50 text-violet-600 text-xs font-medium px-2.5 py-1 rounded-xl border border-violet-100">
                👤 {task.assignedBy}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Progress
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {s.pct}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-2 rounded-full ${s.bar} transition-all duration-700`}
                  style={{ width: `${s.pct}%` }}
                />
              </div>
            </div>

            {/* Row 3: status badge + expand button */}
            <div className="flex items-center justify-between">
              {/* ── shadcn Badge (status) ── */}
              <Badge
                className={`${s.badge} text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5`}
              >
                {s.icon} {task.status}
              </Badge>

              {/* ── shadcn Button (expand) ── */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl h-7 px-3 font-semibold"
              >
                {expanded ? "▲ Less" : "▼ Details"}
              </Button>
            </div>
          </div>

          {/* Expandable description */}
          {expanded && (
            <>
              {/* ── shadcn Separator ── */}
              <Separator />
              <div className="px-4 py-3 bg-slate-50/60">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Description
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {task.desc}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────
export default function Task_show() {
  const [tasks] = useState(ALL_TASKS);
  const { id } = useParams();
  const location = useLocation();

  const fromAdmin = location.state?.fromAdmin;
  const adminViewedFullName = location.state?.adminViewedFullName;

  const role = localStorage.getItem("role");

  const isAdminView = fromAdmin && role === "admin";
  const [fullName, setFullName] = useState(adminViewedFullName || "User");

  // counts for tab badges
  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === "Pending").length,
    inprogress: tasks.filter((t) => t.status === "In Progress").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
  };

  function filterTasks(tab) {
    if (tab === "all") return tasks;
    if (tab === "pending") return tasks.filter((t) => t.status === "Pending");
    if (tab === "inprogress")
      return tasks.filter((t) => t.status === "In Progress");
    if (tab === "completed")
      return tasks.filter((t) => t.status === "Completed");
    return tasks;
  }

  const tabs = [
    { key: "all", label: "All", dot: "bg-slate-400" },
    { key: "pending", label: "Pending", dot: "bg-amber-400" },
    { key: "inprogress", label: "In Progress", dot: "bg-blue-500" },
    { key: "completed", label: "Completed", dot: "bg-emerald-500" },
  ];

  return (
    <div className="card flex min-h-screen ">
      {/* Sidebar */}
      {isAdminView ? <Sidebar_Admin /> : <User_Sidebar fullName={fullName} />}

      <div className="flex-1 md:ml-72">
        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-6 py-8 pt-20 md:pt-8">
          {/* decorative blobs */}
          <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 left-1/4 h-28 w-28 rounded-full bg-white/5" />
          <div className="absolute top-4 right-1/3 h-16 w-16 rounded-full bg-white/5" />

          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/20 text-3xl backdrop-blur-sm shadow-lg ring-1 ring-white/20">
              📝
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                My Tasks
              </h1>
              <p className="text-violet-200 text-sm mt-0.5">
                Track and manage your assigned tasks
              </p>
            </div>
          </div>

          {/* Quick stats strip inside header */}
          <div className="relative mt-5 grid grid-cols-3 gap-3">
            {[
              { label: "Total", value: counts.all, color: "bg-white/20" },
              {
                label: "In Progress",
                value: counts.inprogress,
                color: "bg-blue-500/30",
              },
              {
                label: "Completed",
                value: counts.completed,
                color: "bg-emerald-500/30",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`${s.color} backdrop-blur-sm rounded-2xl px-4 py-3 text-center ring-1 ring-white/10`}
              >
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-5">
          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Tasks"
              value={counts.all}
              gradient="bg-gradient-to-br from-violet-500 to-purple-600"
              icon="📋"
              sub="Assigned to you"
            />
            <StatCard
              label="Pending"
              value={counts.pending}
              gradient="bg-gradient-to-br from-amber-500 to-orange-500"
              icon="⏳"
              sub="Not started yet"
            />
            <StatCard
              label="In Progress"
              value={counts.inprogress}
              gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
              icon="🔄"
              sub="Currently working"
            />
            <StatCard
              label="Completed"
              value={counts.completed}
              gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
              icon="✅"
              sub="Done"
            />
          </div>

          {/* ── Task List Card ── */}
          {/* ── shadcn Card ── */}
          <Card className="rounded-3xl border-0 shadow-xl shadow-slate-200/60 overflow-hidden">
            {/* Gradient top strip */}
            <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-100 text-lg">
                  📝
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Task Board
                  </h2>
                  <p className="text-xs text-slate-400">
                    {tasks.length} tasks assigned
                  </p>
                </div>
              </div>
              {/* ── shadcn Badge ── */}
              <Badge className="bg-violet-100 text-violet-700 border-0 hover:bg-violet-100 font-bold text-xs px-3 py-1 rounded-full">
                May 2026
              </Badge>
            </div>

            {/* ── shadcn Tabs ── */}
            <Tabs defaultValue="all" className="flex flex-col w-full">
              {/* ── shadcn TabsList ── */}
              <TabsList className="flex w-full rounded-none border-b border-slate-100 bg-slate-50/80 h-12 p-1 gap-1 shrink-0">
                {tabs.map((t) => (
                  <TabsTrigger
                    key={t.key}
                    value={t.key}
                    className="flex-1 h-full rounded-xl text-xs font-bold text-slate-400 flex items-center justify-center gap-1.5
                               data-[state=active]:bg-white data-[state=active]:text-violet-600 data-[state=active]:shadow-sm data-[state=active]:shadow-slate-200"
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${t.dot} hidden sm:inline-block`}
                    />
                    <span className="hidden sm:inline">{t.label}</span>
                    <span className="sm:hidden">{t.label.split(" ")[0]}</span>
                    {/* count bubble */}
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {counts[t.key]}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tab contents */}
              {tabs.map((t) => (
                <TabsContent key={t.key} value={t.key} className="mt-0 w-full">
                  <div className="p-4 space-y-3">
                    {filterTasks(t.key).length === 0 ? (
                      <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                        <span className="text-5xl">📭</span>
                        <p className="text-sm font-semibold">
                          No {t.label.toLowerCase()} tasks
                        </p>
                        <p className="text-xs">You're all caught up!</p>
                      </div>
                    ) : (
                      /* ── Task cards grid: 1 col mobile, 2 col desktop ── */
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {filterTasks(t.key).map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
