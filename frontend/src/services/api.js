import axios from "axios";

const base = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
  : "/api";

export const getApiErrorMessage = (
  err,
  fallback = "Something went wrong. Please try again.",
) => {
  if (err?.response) {
    const { status, data } = err.response;

    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      const first = data.errors[0];
      return first?.msg || first?.message || fallback;
    }

    if (status === 400) {
      return "The request was rejected. Please check the form and try again.";
    }

    if (status === 404) {
      return "The requested API route was not found.";
    }

    if (status === 405) {
      return "The request reached the wrong server route. Please check the deployed API URL configuration.";
    }

    if (status >= 500) {
      return "The server failed while handling this request. Please try again shortly.";
    }
  }

  if (err?.request) {
    return "Could not reach the server. Please confirm the API is running and the API URL is correct.";
  }

  if (typeof err?.message === "string" && err.message.trim()) {
    return err.message;
  }

  return fallback;
};

const api = axios.create({
  baseURL: base,
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
