import axios from "axios";

// ── Single source of truth for backend URL ──
// Change VITE_API_URL in frontend/.env to switch environments
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// ── Pre-configured axios instance ──
// All API calls use this instead of raw axios + URL
const api = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT token automatically to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
