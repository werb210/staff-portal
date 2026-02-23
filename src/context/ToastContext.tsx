import { createContext, useContext, useState, type PropsWithChildren } from "react";
import Toast from "../components/Toast";

type ToastVariant = "success" | "error";

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);

  const showToast = (message: string, variant: ToastVariant = "success") => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 4000);
  };

  const showSuccess = (message: string) => showToast(message, "success");
  const showError = (message: string) => showToast(message, "error");

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError }}>
      {children}
      {toast ? <Toast message={toast.message} variant={toast.variant} /> : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
