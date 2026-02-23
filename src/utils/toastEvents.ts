export type ToastVariant = "success" | "error";

const TOAST_EVENT = "portal:toast";

export function showToast(message: string, variant: ToastVariant = "success") {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, variant } }));
}

export function subscribeToToasts(listener: (message: string, variant: ToastVariant) => void) {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<{ message: string; variant: ToastVariant }>;
    listener(customEvent.detail.message, customEvent.detail.variant);
  };

  window.addEventListener(TOAST_EVENT, handler);
  return () => window.removeEventListener(TOAST_EVENT, handler);
}
