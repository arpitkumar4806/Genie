import { create } from "zustand";

export const useChatStore = create((set) => ({
  query: "",
  result: [],
  recentHistory: JSON.parse(localStorage.getItem("history")),
  selectedHistory: "",

  setResult: (result) => set({ result }),
  setQuery: (query) => set({ query }),
  setRecentHistory: (recentHistory) => set({ recentHistory }),
  setSelectedHistory: (selectedHistory) => set({ selectedHistory }),
}));
