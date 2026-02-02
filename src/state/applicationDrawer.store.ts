import { create } from "zustand";
import { readPortalDraft, updatePortalDraft } from "@/utils/portalDraft";

export type DrawerTabId =
  | "application"
  | "financials"
  | "banking"
  | "credit-summary"
  | "documents"
  | "notes"
  | "lenders";

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

const defaultTab = (): DrawerTabId => readPortalDraft().drawerTab ?? "application";

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
    updatePortalDraft({ drawerTab: tab });
    set(() => ({ selectedTab: tab }));
  }
}));
