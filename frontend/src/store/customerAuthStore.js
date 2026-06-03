import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api";

export const useCustomerAuthStore = create(
  persist(
    (set, get) => ({
      customer: null,
      token: null,
      loading: false,
      error: null,
      cart: [],
      cartTotal: 0,

      // ── Auth actions ──────────────────────────────────────────
      register: async (data) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post("/customer/register", data);
          set({
            customer: res.data.customer,
            token: res.data.token,
            loading: false,
          });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || "Registration failed";
          set({ error: msg, loading: false });
          return { success: false, message: msg };
        }
      },

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post("/customer/login", { email, password });
          set({
            customer: res.data.customer,
            token: res.data.token,
            loading: false,
          });
          // Load cart after login
          get().fetchCart();
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || "Login failed";
          set({ error: msg, loading: false });
          return { success: false, message: msg };
        }
      },

      logout: () => {
        set({ customer: null, token: null, cart: [], cartTotal: 0 });
      },

      refreshMe: async () => {
        try {
          const res = await api.get("/customer/me");
          set({ customer: res.data.customer });
        } catch {
          get().logout();
        }
      },

      // ── Cart actions ──────────────────────────────────────────
      fetchCart: async () => {
        try {
          const res = await api.get("/cart");
          set({
            cart: res.data.cart,
            cartTotal: res.data.total,
          });
          return { success: true };
        } catch (err) {
          console.error("Failed to fetch cart:", err);
          return { success: false };
        }
      },

      addToCart: async (productId, vendorId, quantity = 1) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post("/cart/add", {
            productId,
            vendorId,
            quantity,
          });
          await get().fetchCart();
          set({ loading: false });
          return { success: true, message: res.data.message };
        } catch (err) {
          const msg = err.response?.data?.message || "Failed to add to cart";
          set({ error: msg, loading: false });
          return { success: false, message: msg };
        }
      },

      removeFromCart: async (productId) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post("/cart/remove", { productId });
          await get().fetchCart();
          set({ loading: false });
          return { success: true, message: res.data.message };
        } catch (err) {
          const msg =
            err.response?.data?.message || "Failed to remove from cart";
          set({ error: msg, loading: false });
          return { success: false, message: msg };
        }
      },

      updateCartItem: async (productId, quantity) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post("/cart/update", {
            productId,
            quantity,
          });
          await get().fetchCart();
          set({ loading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || "Failed to update cart";
          set({ error: msg, loading: false });
          return { success: false, message: msg };
        }
      },

      clearCart: async () => {
        set({ loading: true, error: null });
        try {
          await api.post("/cart/clear");
          set({ cart: [], cartTotal: 0, loading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || "Failed to clear cart";
          set({ error: msg, loading: false });
          return { success: false, message: msg };
        }
      },

      checkout: async (address) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post("/cart/checkout", { address });
          set({ cart: [], cartTotal: 0, loading: false });
          return {
            success: true,
            orders: res.data.orders,
            totalAmount: res.data.totalAmount,
          };
        } catch (err) {
          const msg = err.response?.data?.message || "Checkout failed";
          set({ error: msg, loading: false });
          return { success: false, message: msg };
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "beetle-customer-auth",
      partialize: (s) => ({
        token: s.token,
        customer: s.customer,
        cart: s.cart,
        cartTotal: s.cartTotal,
      }),
    },
  ),
);
