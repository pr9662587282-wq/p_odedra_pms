import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";
import { RotateCwIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  const navigate = useNavigate();
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const location = useLocation();
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingVerifyOtp, setLoadingVerifyOtp] = useState(false);

  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (otp.length === 6) {
      const timer = setTimeout(() => {
        verifyOtp();
      }, 3000); // 3 seconds delay

      return () => clearTimeout(timer); // cleanup if otp changes
    }
  }, [otp]);

  const login = async (event) => {
    event.preventDefault();
    setLoadingLogin(true);

    try {
      const res = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("username", user.email);
      localStorage.setItem("userId", res.data.user._id);
      // Notify ThemeContext to fetch this user's theme from DB
      window.dispatchEvent(new StorageEvent("storage", { key: "userId" }));
      toast.success("Login successful");
      setLoadingLogin(false);
      if (user.role === "admin") {
        navigate("/deshbaord", { replace: true });
      } else {
        navigate("/UserDeshboard", { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid email or password");
      console.error("Login Error:", err);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:5000/google-login", {
        credential: credentialResponse.credential,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("username", user.email);
      localStorage.setItem("userId", user._id);
      window.dispatchEvent(new StorageEvent("storage", { key: "userId" }));

      toast.success("Google login successful");

      if (user.role === "admin") {
        navigate("/deshbaord", { replace: true });
      } else {
        navigate("/UserDeshboard", { replace: true });
      }
    } catch (err) {
      console.error(err);
      toast.error("Google login failed — make sure backend is running");
    }
  };
  /*const handleGoogleLogin = async (tokenResponse) => {
    try {
      const res = await axios.post("http://localhost:5000/google-login", {
        credential: tokenResponse.access_token, // Backend ko access_token mil jayega
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("username", user.email);
      localStorage.setItem("userId", user._id);

      toast.success("Google login successful");

      if (user.role === "admin") {
        navigate("/deshbaord", { replace: true });
      } else {
        navigate("/UserDeshboard", { replace: true });
      }
    } catch (err) {
      console.error(err);
      toast.error("Google login failed - Backend error (Check server logs)");
    }
  };

  //  Is hook configuration ko bilkul aise hi set karein
  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => handleGoogleLogin(tokenResponse),
    onError: () => toast.error("Google Login Failed"),
    // flow: "auth-code" hata diya 
  });*/
  const handleLinkedInLogin = () => {
    localStorage.setItem("provider", "linkedin");
    window.location.href = "http://localhost:5000/login/linkedin";
  };
  const handleGitHubLogin = () => {
    localStorage.setItem("provider", "github");
    window.location.href = "http://localhost:5000/login/github";
  };
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const token = params.get("token");
    const role = params.get("role");
    const email = params.get("email");
    const userId = params.get("userId");

    // Agar URL mein token aur role milte hain (yaani user LinkedIn se abhi wapas aaya hai)
    if (token && role) {
      // 1. Bilkul Google ki tarah storage mein data set karein
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("username", email || "");
      localStorage.setItem("userId", userId || "");
      // Notify ThemeContext to load this user's theme
      window.dispatchEvent(new StorageEvent("storage", { key: "userId" }));

      const provider = localStorage.getItem("provider");

      if (provider === "linkedin") {
        toast.success("LinkedIn login successful");
      } else if (provider === "github") {
        toast.success("GitHub login successful");
      }

      // 2. Google login wali exact same dashboard condition:
      if (role === "admin") {
        navigate("/deshbaord", { replace: true });
      } else {
        navigate("/UserDeshboard", { replace: true });
      }
    }
  }, [location, navigate]);

  const sendOtp = async () => {
    // 1. Loading toast start karein
    const loadingToast = toast.loading("Sending OTP...");

    try {
      const res = await axios.post("http://localhost:5000/send-otp", {
        phone,
      });

      // 2. Thoda wait karein taaki user ko loading dikhe (e.g., 1 second)
      setTimeout(() => {
        toast.dismiss(loadingToast); // Loading hatao
        toast.success("OTP Sent!"); // Success dikhao

        // 3. Popup open karein
        setShowPhonePopup(false);
        setOtp("");
        setShowOtpPopup(true);

        // 4. 3 second wait karke OTP fill karein
        setTimeout(() => {
          if (res.data.devOtp) {
            setOtp(res.data.devOtp.toString());
          }
        }, 3000);
      }, 1000); // 1 second ka artificial delay for better UX
    } catch (err) {
      toast.dismiss(loadingToast); // Error aane par loading hatayein
      console.error(err);
      toast.error("Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post("http://localhost:5000/verify-otp", {
        phone,
        otp,
      });

      if (res.data.success) {
        const { token, user } = res.data;

        localStorage.setItem("token", token);
        localStorage.setItem("role", user.role);
        localStorage.setItem("username", user.email);
        localStorage.setItem("userId", user._id);
        // Notify ThemeContext to load this user's theme
        window.dispatchEvent(new StorageEvent("storage", { key: "userId" }));

        toast.success("Login Success");

        navigate("/UserDeshboard");
      }
    } catch (err) {
      toast.error("OTP Verification Failed");
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl shadow-slate-200/80 ring-1 ring-slate-200">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-100 text-2xl text-indigo-600">
            <span className="font-black">⌘</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Sign in to your account
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Enter your email and password to access your dashboard.
          </p>
        </div>

        <form onSubmit={login} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="Enter password"
            />
          </div>

          <div className="flex items-center justify-between text-sm text-slate-500">
            <label className="inline-flex items-center gap-2">
              <input
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loadingLogin}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loadingLogin ? (
              <RotateCwIcon className="animate-spin size-5" />
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-sm text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          <span>Or continue with</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="flex justify-center items-center gap-4 mt-4 w-full">
          {/* GOOGLE BUTTON — custom icon with GoogleLogin overlay */}
          <div className="relative flex items-center justify-center h-11 w-11 rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:scale-105 transition overflow-hidden">
            {/* Visible Google icon */}
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="h-5 w-5 absolute z-0 pointer-events-none"
              alt="Google"
            />
            {/* GoogleLogin rendered transparent on top — handles actual OAuth */}
            <div className="absolute inset-0 z-10 opacity-0">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => toast.error("Google login failed")}
                type="icon"
                shape="circle"
                size="large"
              />
            </div>
          </div>

          {/*  LINKEDIN BUTTON */}
          <button
            type="button"
            onClick={handleLinkedInLogin} //  LinkedIn login call
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50 hover:scale-105 active:scale-95 focus:outline-none"
          >
            <img
              src="https://www.svgrepo.com/show/448234/linkedin.svg"
              className="h-5 w-5"
              alt="LinkedIn"
            />
          </button>

          <button
            type="button"
            onClick={() => setShowPhonePopup(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50 hover:scale-105 active:scale-95 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-slate-600"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </button>
          {/* 🔵 FACEBOOK BUTTON */}
          <button
            type="button"
            onClick={() => toast.info("NO API CALL ")} // 👈 Facebook toast call
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50 hover:scale-105 active:scale-95 focus:outline-none"
          >
            <img
              src="https://www.svgrepo.com/show/475647/facebook-color.svg"
              className="h-5 w-5"
              alt="Facebook"
            />
          </button>

          {/* ⬛ GITHUB BUTTON */}
          <button
            type="button"
            onClick={handleGitHubLogin} // 👈 GitHub login call
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50 hover:scale-105 active:scale-95 focus:outline-none"
          >
            <img
              src="https://www.svgrepo.com/show/475654/github-color.svg"
              className="h-5 w-5"
              alt="GitHub"
            />
          </button>
        </div>
        <p className="mt-7 text-center text-sm text-slate-500">
          Don't have an account?
          <a className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700">
            Sign up
          </a>
        </p>

        {/* PHONE POPUP */}
        {showPhonePopup && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl w-[350px]">
              <h2 className="text-lg font-bold mb-4">Phone Login</h2>

              <input
                type="text"
                placeholder="Enter Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border p-3 rounded"
              />

              <button
                onClick={sendOtp}
                className="w-full mt-4 bg-indigo-600 text-white py-2 rounded"
              >
                Send OTP
              </button>

              <button
                onClick={() => setShowPhonePopup(false)}
                className="w-full mt-2 border py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* OTP POPUP */}
        {/* OTP POPUP */}
        {/* OTP POPUP */}
        {showOtpPopup && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="relative bg-white w-[360px] rounded-2xl shadow-2xl p-6">
              {/* Close Button */}
              <button
                onClick={() => setShowOtpPopup(false)}
                className="absolute right-4 top-3 text-slate-400 hover:text-slate-600 text-xl"
              >
                ×
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
                  <span className="text-sky-500 text-xl">✉️</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-center text-lg font-semibold text-slate-800">
                Check Your Email
              </h2>

              {/* Description */}
              <p className="text-center text-sm text-slate-500 mt-2">
                We have sent a verification code to{" "}
                <span className="font-medium text-slate-700">{email}</span>.
              </p>

              <p className="text-center text-sm text-slate-500">
                Enter the 6-digit code below to activate your account.
              </p>

              {/* OTP Inputs */}
              <div className="flex justify-center gap-2 mt-5">
                {Array.from({ length: 6 }).map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={otp[index] || ""}
                    readOnly
                    className="w-11 h-11 text-center text-lg font-semibold border rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                ))}
              </div>

              {/* OTP Hint */}
              <p className="text-center text-xs text-slate-400 mt-3">
                Try 11208 (demo OTP)
              </p>

              {/* Resend */}
              <p className="text-center text-sm mt-4 text-slate-500">
                Didn’t get a code?{" "}
                <button className="text-sky-600 font-medium hover:underline">
                  Resend
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
