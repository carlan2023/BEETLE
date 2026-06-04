import axios from "axios";

const base = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, "") + "/api"
  : "/api";

const AUTH_KEYS = {
  admin: "beetle-admin",
  vendor: "beetle-auth",
  customer: "beetle-customer-auth",
};

const getStoredToken = (key) => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (key === AUTH_KEYS.admin) return parsed?.token || null;
    return parsed?.state?.token || parsed?.token || null;
  } catch {
    return null;
  }
};

const getRequestScope = (url = "") => {
  if (url.startsWith("/admin")) return "admin";
  if (url.startsWith("/customer") || url.startsWith("/cart")) return "customer";
  if (
    url.startsWith("/auth") ||
    url.startsWith("/vendor") ||
    url.startsWith("/products") ||
    url.startsWith("/orders")
  ) {
    return "vendor";
  }
  return null;
};

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
  const scope = getRequestScope(config.url || "");
  const tokensByScope = {
    admin: getStoredToken(AUTH_KEYS.admin),
    vendor: getStoredToken(AUTH_KEYS.vendor),
    customer: getStoredToken(AUTH_KEYS.customer),
  };

  const token =
    (scope && tokensByScope[scope]) ||
    tokensByScope.admin ||
    tokensByScope.vendor ||
    tokensByScope.customer;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const scope =
        getRequestScope(err.config?.url || "") ||
        (window.location.pathname.startsWith("/admin")
          ? "admin"
          : window.location.pathname.startsWith("/customer") ||
              window.location.pathname.startsWith("/cart")
            ? "customer"
            : "vendor");

      if (scope === "admin") {
        localStorage.removeItem(AUTH_KEYS.admin);
        window.location.href = "/admin/login";
      } else if (scope === "customer") {
        localStorage.removeItem(AUTH_KEYS.customer);
        window.location.href = "/customer/login";
      } else {
        localStorage.removeItem(AUTH_KEYS.vendor);
        window.location.href = "/vendor/login";
      }
    }
    return Promise.reject(err);
  },
);

export default api;
