import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'dark', // 'dark' or 'light'
      
      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        }));
      },

      setTheme: (theme) => {
        if (theme === 'dark' || theme === 'light') {
          set({ theme });
        }
      },
    }),
    {
      name: 'beetle-theme',
    }
  )
);
