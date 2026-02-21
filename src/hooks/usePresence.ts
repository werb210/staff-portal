import { useEffect } from "react";

export function usePresence(userId: string) {
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      void fetch(`${import.meta.env.VITE_STAFF_SERVER}/presence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          staffId: userId,
          isOnline: true,
          isOnCall: false
        })
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [userId]);
}
