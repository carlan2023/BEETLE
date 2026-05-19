import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      vendor: null,
      token: null,
      loading: false,
      error: null,

      register: async (data) => {
        set({ loading: true, error: null })
        try {
          const res = await api.post('/auth/register', data)
          set({ vendor: res.data.vendor, token: res.data.token, loading: false })
          return { success: true }
        } catch (err) {
          const msg = err.response?.data?.message || 'Registration failed'
          set({ error: msg, loading: false })
          return { success: false, message: msg }
        }
      },

      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const res = await api.post('/auth/login', { email, password })
          set({ vendor: res.data.vendor, token: res.data.token, loading: false })
          return { success: true }
        } catch (err) {
          const msg = err.response?.data?.message || 'Login failed'
          set({ error: msg, loading: false })
          return { success: false, message: msg }
        }
      },

      logout: () => {
        set({ vendor: null, token: null })
      },

      refreshMe: async () => {
        try {
          const res = await api.get('/auth/me')
          set({ vendor: res.data.vendor })
        } catch {
          get().logout()
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'beetle-auth',
      partialize: (s) => ({ token: s.token, vendor: s.vendor }),
    }
  )
)
