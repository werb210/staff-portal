import { create } from "zustand";

type ApiToast = {
  message: string;
  requestId?: string;
};

type ApiNotificationsState = {
  toast: ApiToast | null;
  setToast: (toast: ApiToast | null) => void;
};

export const useApiNotificationsStore = create<ApiNotificationsState>((set) => ({
  toast: null,
  setToast: (toast) => set({ toast })
}));

export const showApiToast = (message: string, requestId?: string) => {
  useApiNotificationsStore.setState({ toast: { message, requestId } });
};

export const clearApiToast = () => {
  useApiNotificationsStore.setState({ toast: null });
};
