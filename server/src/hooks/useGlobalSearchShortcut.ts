import { useEffect } from "react";
import { useSearchStore } from "../state/searchStore";

export default function useGlobalSearchShortcut() {
  const setOpen = useSearchStore((s) => s.setOpen);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
