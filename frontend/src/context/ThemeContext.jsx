import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import axios from "axios";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  // Apply theme to DOM whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
  }, [theme]);

  // Core: fetch this user's theme from DB using their token
  const fetchUserTheme = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      // Not logged in — use light
      setTheme("light");
      return;
    }

    // Check localStorage first for instant load (no flicker)
    const cached = localStorage.getItem(`theme_${userId}`);
    if (cached) setTheme(cached);

    try {
      const res = await axios.get("http://localhost:5000/get-theme", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userTheme = res.data.theme || "light";
      localStorage.setItem(`theme_${userId}`, userTheme);
      setTheme(userTheme);
    } catch {
      // Server not running — cached value already applied above
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchUserTheme();
  }, [fetchUserTheme]);

  // Listen for login events from any login method (email, Google, LinkedIn, OTP)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "userId" || e.key === "token") {
        fetchUserTheme();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [fetchUserTheme]);

  const toggleTheme = async () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    const userId = localStorage.getItem("userId") || "guest";
    const token = localStorage.getItem("token");

    setTheme(newTheme);
    localStorage.setItem(`theme_${userId}`, newTheme);

    try {
      if (token) {
        await axios.post(
          "http://localhost:5000/save-theme",
          { theme: newTheme },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
    } catch {
      // Server not running — toggle still works locally
    }
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, refreshTheme: fetchUserTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
