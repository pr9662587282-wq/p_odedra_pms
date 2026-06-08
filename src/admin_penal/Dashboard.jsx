import React, { useState, useEffect } from "react";
import Sidebar_Admin from "./Sidebar_Admin";
import { useTheme } from "../Theme/ThemeContext";
import Register from "../auth/Register";
import logo from "../assets/photo-1624770802806-5df97af960b6.png";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

function Dashboard({ onAddUser }) {
  const { theme, toggleTheme } = useTheme();
  const [openRegister, setOpenRegister] = useState(false);
  return (
    <div
      className={`min-h-screen px-3 pb-8 pt-20 md:ml-80 md:px-6 md:pt-0 ${
        theme === "dark" ? " text-white" : "bg-slate-400 text-black"
      }`}
    >
      <Sidebar_Admin onAddUser={() => setOpenRegister(true)} />

      {/* ── Register popup overlay ── */}
      {openRegister && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          {/* Blurred backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenRegister(false)}
          />
          {/* Card */}
          <div className="relative z-10 w-full max-w-sm shadow-2xl rounded-2xl overflow-hidden">
            <Register isModal={true} onClose={() => setOpenRegister(false)} />
          </div>
        </div>
      )}
      {/* Header — mobile: centered | desktop: original layout */}
      <div className=" card mx-auto mb-6  w-full   p-4 border-none md:relative md:top-[1px] md:mb-6 md:h-[78px] md:w-[920px] md:p-1 md:ml-[650px]">
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
                  className="gap-4 relative md:top-1 top-1 "
                >
                  {" "}
                  <img
                    src={logo}
                    alt="profile"
                    className="h-10 w-10 rounded-full object-cover "
                  />{" "}
                  User Profile
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
                    <span className="text-popover-foreground">
                      Phillip George
                    </span>
                    <span className="text-muted-foreground text-xs space-y-4">
                      phillip@example.com
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
        <div className="grid w-full gap-12 xl:grid-cols-[1.45fr_1fr]">
          <div className="mx-auto grid w-full gap-4 sm:grid-cols-2 sm:gap-6 md:h-[200px]">
            <div className="card w-full rounded-[1.5rem] p-5 shadow-sm ring-1 sm:p-6">
              <p className="text-sm font-medium ">Customers</p>
              <div className="mt-4 flex items-center justify-between gap-4 sm:mt-6">
                <div>
                  <p className="text-3xl font-semibold sm:text-4xl">3,782</p>
                  <p className="mt-2 text-sm">Total customers</p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  +11.01%
                </span>
              </div>
            </div>

            <div className=" card w-full rounded-[1.5rem] p-5  shadow-sm ring-1 sm:p-6">
              <p className="text-sm font-medium ">Orders</p>
              <div className="mt-4 flex items-center justify-between gap-4 sm:mt-6">
                <div>
                  <p className="text-3xl font-semibold sm:text-4xl">5,359</p>
                  <p className="mt-2 text-sm ">New orders</p>
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
                <p className="text-sm font-medium">Monthly Target</p>
                <h2 className="mt-2 text-lg font-semibold tracking-tight sm:mt-3 sm:text-2xl">
                  Target you&apos;ve set for each month
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
                      75.55%
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
                <p className="text-xs uppercase tracking-[0.3em]">Target</p>
                <p className="mt-2 text-xl font-semibold sm:mt-3 sm:text-2xl">
                  $20K
                </p>
              </div>
              <div className=" card rounded-3xl p-4 text-center sm:text-left">
                <p className="text-xs uppercase tracking-[0.3em]0">Revenue</p>
                <p className="mt-2 text-xl font-semibold  sm:mt-3 sm:text-2xl">
                  $20K
                </p>
              </div>
              <div className=" card rounded-3xl p-4 text-center sm:text-left">
                <p className="text-xs uppercase tracking-[0.3em] ">Today</p>
                <p className="mt-2 text-xl font-semibold 0 sm:mt-3 sm:text-2xl">
                  $20K
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr] md:h-[700px]">
          <div className=" card rounded-[2rem] b p-8 shadow-sm ring-1  md:h-[500px] w-[100%] relative md:bottom-[390px] md:w-[738px]">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium ">Monthly Sales</p>
                <h2 className="mt-2 text-lg font-semibold  sm:text-xl">
                  Your performance this month
                </h2>
              </div>
              <span className="w-fit rounded-full  px-3 py-1 text-sm font-semibold">
                +24.3%
              </span>
            </div>

            <div className="mt-6 sm:mt-8">
              <div className="flex h-64 w-full items-end gap-2 px-2">
                {salesBars.map((value, index) => {
                  const height = Math.min(value * 2, 100); // safety cap

                  return (
                    <div
                      key={index}
                      className="flex flex-1 flex-col items-center"
                    >
                      {/* chart area */}
                      <div className="relative flex h-52 w-full items-end justify-center">
                        {/* background */}
                        <div className="absolute bottom-0 h-full w-4 rounded-full "></div>

                        {/* bar */}
                        <div
                          className="z-10 w-4 rounded-full bg-blue-500"
                          style={{ height: `${height}%` }}
                        />
                      </div>

                      {/* label */}
                      <p className="mt-2 text-[10px] text-slate-500 sm:text-xs">
                        {salesLabels[index]}
                      </p>
                    </div>
                  );
                })}
              </div>
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
