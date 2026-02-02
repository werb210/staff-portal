import { useCallback, useEffect, useState } from "react";

type UpdateDetail = {
  registration?: ServiceWorkerRegistration;
};

const isBrowser = typeof window !== "undefined";
const RELOAD_GUARD_KEY = "sw:reload-guard";

export const useServiceWorkerUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!isBrowser) return;
    if (window.sessionStorage.getItem(RELOAD_GUARD_KEY)) {
      window.sessionStorage.removeItem(RELOAD_GUARD_KEY);
    }
    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<UpdateDetail>).detail;
      if (detail?.registration) {
        setRegistration(detail.registration);
      }
      setUpdateAvailable(true);
    };
    const handleControllerChange = () => {
      if (window.sessionStorage.getItem(RELOAD_GUARD_KEY)) return;
      window.sessionStorage.setItem(RELOAD_GUARD_KEY, "true");
      window.location.reload();
    };
    window.addEventListener("sw:update", handleUpdate);
    navigator.serviceWorker?.addEventListener("controllerchange", handleControllerChange);
    return () => {
      window.removeEventListener("sw:update", handleUpdate);
      navigator.serviceWorker?.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  const applyUpdate = useCallback(async () => {
    if (!registration) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setUpdateAvailable(false);
      return;
    }
    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      setUpdateAvailable(false);
      return;
    }
    try {
      await registration.update();
      setUpdateAvailable(false);
    } catch {
      setUpdateAvailable(false);
    }
  }, [registration]);

  const dismiss = useCallback(() => setUpdateAvailable(false), []);

  return {
    updateAvailable,
    applyUpdate,
    dismiss
  };
};
