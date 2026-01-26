import { useCallback, useEffect, useState } from "react";
import { getPushSubscription, setPushSubscription } from "@/utils/pushSubscriptionStore";

type PushState = "unsupported" | "default" | "granted" | "denied";

const decodeBase64Key = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
};

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<PushState>("unsupported");
  const [subscription, setSubscription] = useState<PushSubscription | null>(getPushSubscription());

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (permission === "granted" && !subscription) {
      void subscribe();
    }
  }, [permission, subscribe, subscription]);

  const subscribe = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return null;
    }
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      setPushSubscription(existing);
      setSubscription(existing);
      return existing;
    }

    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
    if (!vapidKey) {
      console.info("Push subscription skipped: missing VAPID key");
      return null;
    }

    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeBase64Key(vapidKey)
    });
    setPushSubscription(newSubscription);
    setSubscription(newSubscription);
    return newSubscription;
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return null;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      return subscribe();
    }
    return null;
  }, [subscribe]);

  return {
    permission,
    subscription,
    requestPermission,
    isSupported: permission !== "unsupported"
  };
};
