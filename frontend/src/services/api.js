import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api" || "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  // Prefer admin token if present, otherwise vendor token
  const rawAdmin = localStorage.getItem("beetle-admin");
  if (rawAdmin) {
    try {
      const { token } = JSON.parse(rawAdmin);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      }
    } catch {}
  }
  const raw = localStorage.getItem("beetle-auth");
  if (raw) {
    const { state } = JSON.parse(raw);
    if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // clear both auth keys and redirect based on path
      localStorage.removeItem("beetle-auth");
      localStorage.removeItem("beetle-admin");
      if (window.location.pathname.startsWith("/admin"))
        window.location.href = "/admin/login";
      else window.location.href = "/vendor/login";
    }
    return Promise.reject(err);
  },
);

export default api;
