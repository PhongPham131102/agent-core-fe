import { createPersistedStore } from "@/lib/store";

interface IAppState {
  sidebarCollapsed: boolean;
}

interface IAppActions {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

/** UI state toàn app. Không chứa dữ liệu từ API (việc đó của React Query). */
export const useAppStore = createPersistedStore<IAppState, IAppActions>({
  name: "app",
  initialState: { sidebarCollapsed: false },
  actions: (set) => ({
    toggleSidebar: () =>
      set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }), false, "toggleSidebar"),
    setSidebarCollapsed: (sidebarCollapsed) =>
      set({ sidebarCollapsed }, false, "setSidebarCollapsed"),
  }),
  persist: {
    version: 1,
    partialize: ({ sidebarCollapsed }) => ({ sidebarCollapsed }),
  },
});
