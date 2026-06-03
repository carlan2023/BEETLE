import api from "./api";

// ── Public Pages API ──────────────────────────────────────────────────────────

export const getRestaurants = async (page = 1, limit = 12) => {
  const response = await api.get("/public/restaurants", {
    params: { page, limit },
  });
  return response.data;
};

export const getGroceries = async (page = 1, limit = 12) => {
  const response = await api.get("/public/groceries", {
    params: { page, limit },
  });
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get("/public/categories");
  return response.data;
};

export const browseVendors = async (page = 1, limit = 12, category = null) => {
  const response = await api.get("/public/browse-vendors", {
    params: { page, limit, category },
  });
  return response.data;
};

export const signupAsRider = async (formData) => {
  const response = await api.post("/public/rider-signup", formData);
  return response.data;
};

export const searchPublic = async (query, type = "all", limit = 10) => {
  const response = await api.get("/public/search", {
    params: { q: query, type, limit },
  });
  return response.data;
};

export const getProducts = async (page = 1, limit = 12, category = null) => {
  const response = await api.get("/public/products", {
    params: { page, limit, ...(category && { category }) },
  });
  return response.data;
};

export default {
  getRestaurants,
  getGroceries,
  getCategories,
  browseVendors,
  signupAsRider,
  searchPublic,
  getProducts,
};
