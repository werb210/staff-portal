import { useCallback, useEffect, useState } from "react";

type UpdateDetail = {
  registration?: ServiceWorkerRegistration;
};

const isBrowser = typeof window !== "undefined";

export const useServiceWorkerUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!isBrowser) return;
    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<UpdateDetail>).detail;
      if (detail?.registration) {
        setRegistration(detail.registration);
      }
      setUpdateAvailable(true);
    };
    const handleControllerChange = () => {
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
