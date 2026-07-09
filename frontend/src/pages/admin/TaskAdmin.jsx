import { Button } from "@/components/ui/button";
import Sidebar_Admin from "./Sidebar_Admin";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Task_admin = () => {
  const employees = [
    "rahul@company.com",
    "amit@company.com",
    "neha@company.com",
    "priya@company.com",
  ];

  const tasks = [
    {
      desc: "Prepare new quotation",
      company: "Brainlounge",
      type: "Call",
      status: "In progress",
      priority: "Urgent",
      date: "Nov 21, 2023",
      owners: ["LW", "AH", "DR"],
    },
    {
      desc: "6 weekly service call",
      company: "Hugeable",
      type: "Call",
      status: "Completed",
      priority: "Medium",
      date: "Nov 21, 2023",
      owners: ["AH", "RM"],
    },
    {
      desc: "Ask to the next event",
      company: "Sremtex",
      type: "Event",
      status: "Not started",
      priority: "Low",
      date: "Nov 20, 2023",
      owners: ["ZD", "JF"],
    },
    {
      desc: "Database Optimization",
      company: "SoftHub",
      type: "Development",
      status: "Completed",
      priority: "Medium",
      date: "Jun 02, 2026",
      owners: ["AR", "KD"],
    },
    {
      desc: "Client Meeting",
      company: "Zydus",
      type: "Meeting",
      status: "Not started",
      priority: "Urgent",
      date: "Jun 03, 2026",
      owners: ["PP"],
    },
    {
      desc: "Mobile App Testing",
      company: "Brainlounge",
      type: "Testing",
      status: "In progress",
      priority: "High",
      date: "Jun 05, 2026",
      owners: ["NV", "JP"],
    },
  ];

  function Badge({ children }) {
    return (
      <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
        {children}
      </span>
    );
  }

  function Status({ status }) {
    const color =
      status === "Completed"
        ? "bg-green-100 text-green-600"
        : status === "In progress"
          ? "bg-blue-100 text-blue-600"
          : "bg-slate-100 text-slate-600";

    return (
      <span className={`px-2 py-1 rounded-full text-xs ${color}`}>
        {status}
      </span>
    );
  }

  function Priority({ priority }) {
    const color =
      priority === "Urgent"
        ? "bg-red-100 text-red-600"
        : priority === "High"
          ? "bg-orange-100 text-orange-600"
          : priority === "Medium"
            ? "bg-blue-100 text-blue-600"
            : "bg-green-100 text-green-600";

    return (
      <span className={`px-2 py-1 rounded-full text-xs ${color}`}>
        {priority}
      </span>
    );
  }

  return (
    <div>
      <Sidebar_Admin />

      <div
        className="
backdrop-blur-xl
bg-white/80
dark:bg-slate-900/80
border
border-white/20
rounded-3xl
shadow-[0_20px_60px_rgba(0,0,0,0.15)]
p-6
w-full
max-w-[1450px]
mx-auto
relative
top-[80px]
md:ml-[330px]
hover:shadow-[0_30px_80px_rgba(99,102,241,0.25)]
transition-all
duration-500
"
      >
        {/* Header */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full bottom-[20px]  sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl shadow-md relative md:left-[1200px] md:top-[10px]">
              + Assign Task
            </Button>
          </DialogTrigger>

          <DialogContent
            className="
          sm:max-w-[520px]
          w-[95%]
          rounded-3xl
          border-0
          p-1
          overflow-hidden
          shadow-2xl
        "
          >
            <form className="flex flex-col">
              {/* Header (Android-style gradient top bar) */}
              <div></div>
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-5 text-white">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">
                    Assign Task
                  </DialogTitle>
                  <DialogDescription className="text-white/80 text-sm">
                    Create and assign task in seconds
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5 bg-white">
                {/* Task Title */}
                <div className="space-y-2">
                  <Label className="text-sm text-slate-600">Title</Label>
                  <Input
                    placeholder="Enter task title"
                    className="rounded-2xl h-11 bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>

                {/* Assign */}
                <div className="space-y-2">
                  <Label className="text-sm text-slate-600">Assign To</Label>
                  <Select>
                    <SelectTrigger className="rounded-2xl h-11 bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((email, i) => (
                        <SelectItem key={i} value={email}>
                          {email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-sm text-slate-600">Description</Label>
                  <Textarea
                    placeholder="Write task details..."
                    className="rounded-2xl min-h-[90px] bg-slate-50 border-slate-200"
                  />
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <Label className="text-sm text-slate-600">Deadline</Label>
                  <Input
                    type="datetime-local"
                    className="rounded-2xl h-11 bg-slate-50 border-slate-200"
                  />
                </div>
              </div>

              {/* Footer (sticky modern action bar feel) */}
              <DialogFooter className="p-4 bg-slate-50 border-t flex gap-3">
                <DialogClose asChild>
                  <Button variant="outline" className="w-1/2 rounded-2xl h-11">
                    Cancel
                  </Button>
                </DialogClose>

                <Button
                  type="submit"
                  className="w-1/2 rounded-2xl h-11 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                >
                  Assign
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <div className="flex items-center justify-between mb-4 relative">
          <h1 className="text-xl font-semibold">Task</h1>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:gap-2">
            {/* Task Status */}
            <Select defaultValue="all">
              <SelectTrigger className="card border px-3 py-2 rounded-xl text-sm w-full md:w-[200px] text-black">
                <SelectValue placeholder="All Tasks" />
              </SelectTrigger>
              <SelectContent className="text-black bg-white">
                <SelectItem value="all">All Task</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="inprogress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Teams */}
            <Select defaultValue="all-teams">
              <SelectTrigger className="card text-black border px-3 py-2 rounded-xl text-sm w-full md:w-[180px]">
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent className="text-black bg-white">
                <SelectItem value="all-teams">All Teams</SelectItem>
                <SelectItem value="a1">Sales Team A1</SelectItem>
                <SelectItem value="a2">Sales Team A2</SelectItem>
                <SelectItem value="marketing">Marketing Team</SelectItem>
                <SelectItem value="dev">Development Team</SelectItem>
              </SelectContent>
            </Select>

            {/* Users */}
            <Select defaultValue="all-users">
              <SelectTrigger className="card text-black border px-3 py-2 rounded-xl text-sm w-full md:w-[200px]">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent className="text-black bg-white">
                <SelectItem value="all-users">All Users</SelectItem>
                <SelectItem value="prakash">Prakash@email.com</SelectItem>
                <SelectItem value="rahul">Rahul@email.com</SelectItem>
                <SelectItem value="neha">Neha@email.com</SelectItem>
              </SelectContent>
            </Select>

            {/* Time Filter */}
            <Select defaultValue="all-time">
              <SelectTrigger className="card text-black border px-3 py-2 rounded-xl text-sm w-full md:w-[180px]">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent className="text-black bg-white">
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Task Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Owner</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {tasks.map((t, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Checkbox />
                </TableCell>

                <TableCell>{t.desc}</TableCell>
                <TableCell>{t.company}</TableCell>

                <TableCell>
                  <Badge>{t.type}</Badge> 
                </TableCell>

                <TableCell>
                  <Status status={t.status} />
                </TableCell>

                <TableCell>
                  <Priority priority={t.priority} />
                </TableCell>

                <TableCell>{t.date}</TableCell>

                <TableCell className="flex gap-1">
                  {t.owners.map((o, idx) => (
                    <span
                      key={idx}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-sky-500 text-white text-xs"
                    >
                      {o}
                    </span>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Task_admin;
