import { create } from "zustand";

export const useAppStore = create((set) => ({
  loading: 0,
  theme: "light",
  isOpen: false,
  isChecked: false,

  setLoading: (loading) => set({ loading }),
  setTheme: (theme) => set({ theme }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setIsChecked: () => set((state) => ({ isChecked: !state.isChecked })),
}));
