import { useEffect } from "react";
import { useAuthStore } from "@/state/authStore";

export function useAuthInit() {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    fetchMe();
  }, []);
}
