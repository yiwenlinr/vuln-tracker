import axios from "axios";

// Shared Axios instance for all frontend API requests
const api = axios.create({
  baseURL: "http://localhost:4000",
});

// Attach the JWT token automatically if it exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;