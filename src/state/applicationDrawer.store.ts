import { create } from "zustand";

export type DrawerTabId = "application" | "banking" | "financial" | "documents" | "notes" | "credit" | "lenders";

export type ApplicationDrawerState = {
  isOpen: boolean;
  selectedApplicationId: string | null;
  selectedTab: DrawerTabId;
};

export type ApplicationDrawerActions = {
  open: (applicationId: string, tab?: DrawerTabId) => void;
  close: () => void;
  setTab: (tab: DrawerTabId) => void;
};

const defaultTab = (): DrawerTabId => {
  if (typeof window === "undefined") return "application";
  const stored = window.localStorage.getItem("application-drawer-tab") as DrawerTabId | null;
  return stored ?? "application";
};

export const useApplicationDrawerStore = create<ApplicationDrawerState & ApplicationDrawerActions>((set) => ({
  isOpen: false,
  selectedApplicationId: null,
  selectedTab: defaultTab(),
  open: (applicationId, tab) =>
    set(() => ({
      isOpen: true,
      selectedApplicationId: applicationId,
      selectedTab: tab ?? defaultTab()
    })),
  close: () => set(() => ({ isOpen: false, selectedApplicationId: null })),
  setTab: (tab) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("application-drawer-tab", tab);
    }
    set(() => ({ selectedTab: tab }));
  }
}));
