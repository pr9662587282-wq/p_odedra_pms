import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function Forget_password() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/forgetPassword`, {
        email,
        newPassword: password,
      });

      toast.success(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Error updating Password");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg rounded-[32px] bg-white px-8 py-10 shadow-2xl shadow-slate-200/70 ring-1 ring-slate-200">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-100 text-3xl text-indigo-600">
            <span>🔒</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Reset your password
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Enter your email and new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          {/* EMAIL INPUT ADDED */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email address
            </label>

            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter email"
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* PASSWORD INPUT */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              New password
            </label>

            <input
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="Enter new password"
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            Update password
          </button>
        </form>

        <div className="mt-8 flex items-center justify-between text-sm text-slate-500">
          <p className="text-slate-500">Remembered your password?</p>
          <Link
            to="/"
            className="font-semibold text-indigo-600 transition hover:text-indigo-700"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
