import axios from "axios";
import { clearSession } from "./session";

// Shared Axios instance for all frontend API requests
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
});

// Attach the JWT token automatically if it exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// If the session is no longer valid, clear local data and go back to login.
// The login request itself is excluded so "Invalid credentials" can be shown.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url === "/auth/login";

    if (error.response?.status === 401 && !isLoginRequest) {
      clearSession();
      window.location.assign("/");
    }

    return Promise.reject(error);
  }
);

export default api;
