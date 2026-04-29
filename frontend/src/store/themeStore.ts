import { create } from "zustand";

interface ThemeStore {
  theme: string;
  setTheme: (theme: string) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: localStorage.getItem("streamify-theme") || "coffee",
  setTheme: (theme: string) => {
    localStorage.setItem("streamify-theme", theme);
    set({ theme });
  },
}));