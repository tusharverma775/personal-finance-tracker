import axios from "axios";
import { getAuthToken, logout } from "../utils/authHelpers";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" }
});

// Attach token to requests
client.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 and forward error
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // token invalid or expired -> clear and redirect to login
      logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default client;
