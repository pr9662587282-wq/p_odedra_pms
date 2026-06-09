import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CheckCircle2Icon, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Register({ isModal = false, onClose }) {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [permissions, setPermissions] = useState({
    profile: { viewer: true, editor: false, deletePermission: false },
    attendance: { viewer: false, editor: false },
    task: { viewer: false, editor: false },
  });
  const handlePermissionChange = (mod, perm, val) =>
    setPermissions({
      ...permissions,
      [mod]: { ...permissions[mod], [perm]: val },
    });

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordErr, setpasswordErr] = useState(false);
  const [passErrShow, setpassErrShow] = useState("");

  const register = () => {
    if (!passwordRegex.test(password)) {
      setpasswordErr(true);
      setpassErrShow("Password must be 8+ chars, number & special char ❌");
      return;
    }
    axios
      .post("http://localhost:5000/register", {
        email,
        password,
        role: "user",
        permissions,
      })
      .then((res) => {
        setMessage(res.data.message);
        setShowAlert(true);
        setemail("");
        setpassword("");
        setPermissions({
          profile: { viewer: true, editor: false },
          attendance: { viewer: false, editor: false },
          task: { viewer: false, editor: false },
        });
        setTimeout(() => navigate("/login"), 3000);
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Error");
        console.log(err);
      });
  };

  const card = (
    <div className="w-full bg-white rounded-2xl overflow-hidden">
      <div className="relative bg-gradient-to-b from-[#ddeeff] to-white px-8 pt-7 pb-5 text-center">
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-4 text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            ×
          </button>
        )}
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#e8f4ff] text-[#3b9eff]">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-slate-800">
          Create User`s account
        </h2>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
          Make a new account to bring your words, data
          <br />
          and teams together. For free.
        </p>
      </div>
      <div className="px-7 pb-7 pt-1">
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Permissions
            </label>
            <div className="overflow-hidden rounded-lg border border-slate-200 text-xs">
              <div className="grid grid-cols-4 bg-slate-50 px-3 py-2 font-semibold text-slate-500">
                <span>Module</span>
                <span className="text-center">Viewer</span>
                <span className="text-center">Editor</span>
                <span className="text-center">Delete</span>
              </div>
              <div className="grid grid-cols-4 items-center px-3 py-2 border-t border-slate-100 text-slate-700">
                <span>Profile</span>
                <label className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={permissions.profile.viewer}
                    disabled
                    className="h-3.5 w-3.5 accent-blue-500"
                  />
                </label>
                <label className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={permissions.profile.editor}
                    onChange={(e) =>
                      handlePermissionChange(
                        "profile",
                        "editor",
                        e.target.checked,
                      )
                    }
                    className="h-3.5 w-3.5 accent-blue-500"
                  />
                </label>
                <label className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={permissions.profile.deletePermission}
                    onChange={(e) =>
                      handlePermissionChange(
                        "profile",
                        "deletePermission",
                        e.target.checked,
                      )
                    }
                    className="h-3.5 w-3.5 accent-blue-500"
                  />
                </label>
              </div>
              <div className="grid grid-cols-4 items-center px-3 py-2 border-t border-slate-100 text-slate-700">
                <span>Attendance</span>
                <label className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={permissions.attendance.viewer}
                    onChange={(e) =>
                      handlePermissionChange(
                        "attendance",
                        "viewer",
                        e.target.checked,
                      )
                    }
                    className="h-3.5 w-3.5 accent-blue-500"
                  />
                </label>
                <label className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={permissions.attendance.editor}
                    onChange={(e) =>
                      handlePermissionChange(
                        "attendance",
                        "editor",
                        e.target.checked,
                      )
                    }
                    className="h-3.5 w-3.5 accent-blue-500"
                  />
                </label>
                <span className="text-center text-slate-300">—</span>
              </div>
              <div className="grid grid-cols-4 items-center px-3 py-2 border-t border-slate-100 text-slate-700">
                <span>Task</span>
                <label className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={permissions.task.viewer}
                    onChange={(e) =>
                      handlePermissionChange("task", "viewer", e.target.checked)
                    }
                    className="h-3.5 w-3.5 accent-blue-500"
                  />
                </label>
                <label className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={permissions.task.editor}
                    onChange={(e) =>
                      handlePermissionChange("task", "editor", e.target.checked)
                    }
                    className="h-3.5 w-3.5 accent-blue-500"
                  />
                </label>
                <span className="text-center text-slate-300">—</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={register}
            className="w-full rounded-lg bg-[#1a8cff] hover:bg-[#0077ee] py-2.5 text-sm font-semibold text-white transition"
          >
            + Add User
          </button>
        </form>
        <div className="my-3 flex items-center gap-3 text-[11px] text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          <span>Or sign in with</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>
        <div className="flex justify-center gap-3">
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition">
            <svg
              className="h-5 w-5 text-[#1877f2]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition">
            <svg
              className="h-5 w-5 text-slate-800"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-500 hover:text-blue-600"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );

  // Alerts (always rendered on top)
  const alerts = (
    <>
      {showAlert && (
        <div className="fixed inset-x-0 top-0 z-[200] flex justify-center pt-4 pointer-events-none px-4">
          <Alert className="pointer-events-auto flex items-center gap-4 w-full max-w-[450px] bg-neutral-900 text-white shadow-xl rounded-3xl border-none p-4 animate-in slide-in-from-top-8 duration-300 ease-out">
            {/* Android-style Left Icon Container */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400">
              <CheckCircle2Icon className="h-5 w-5" />
            </div>

            {/* Notification Content */}
            <div className="flex-1 min-w-0">
              <AlertTitle className="text-sm font-semibold tracking-wide text-neutral-100 mb-0.5 truncate">
                {message || "Success"}
              </AlertTitle>
              <AlertDescription className="text-xs text-neutral-400 font-medium">
                Redirecting to login...
              </AlertDescription>
            </div>

            {/* Subtle Right-side Time/Dot indicator (Optional but feels very Android) */}
            <div className="text-[10px] text-neutral-500 font-medium self-start pt-0.5 select-none">
              now
            </div>
          </Alert>
        </div>
      )}
      {passwordErr && (
        <div
          onClick={() => setpasswordErr(false)}
          className="fixed inset-x-0 top-4 z-[200] flex justify-center px-4"
        >
          <Alert
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[450px] rounded-2xl shadow-lg border-red-200 bg-white flex gap-3 p-4"
          >
            <TriangleAlertIcon className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <AlertTitle className="text-base font-semibold text-zinc-900">
                {passErrShow || "Password Error"}
              </AlertTitle>
              <AlertDescription className="text-sm text-zinc-500 mt-1">
                Please fix the error and try again.
              </AlertDescription>
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => setpasswordErr(false)}
                  className="text-sm text-red-600 font-medium"
                >
                  OK
                </button>
              </div>
            </div>
          </Alert>
        </div>
      )}
    </>
  );

  // ── Modal mode: just the card (Dialog handles the overlay) ──
  if (isModal)
    return (
      <>
        {alerts}
        {card}
      </>
    );

  // ── Standalone /register page: blurred background + card ──
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#e8eaed]">
      {alerts}
      {/* Blurred fake bg */}
      <div className="absolute inset-0 blur-sm pointer-events-none select-none">
        <div className="flex items-center justify-between px-10 py-4 bg-white border-b border-slate-200">
          <div className="h-4 w-20 bg-slate-300 rounded" />
          <div className="flex gap-4">
            <div className="h-4 w-16 bg-slate-300 rounded" />
            <div className="h-8 w-20 bg-blue-400 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-5 p-10 mt-2">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm"
            >
              <div className="h-3 w-2/3 bg-slate-200 rounded mb-3" />
              <div className="h-3 w-full bg-slate-100 rounded mb-2" />
              <div className="h-3 w-4/5 bg-slate-100 rounded mb-2" />
              <div className="h-3 w-1/2 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
        <div className="w-full max-w-sm shadow-2xl">{card}</div>
      </div>
    </div>
  );
}
