import { useEffect } from "react";
import { useGlobalError } from "../hooks/useGlobalError";

export default function ErrorToast() {
  const message = useGlobalError((s) => s.message);
  const setError = useGlobalError((s) => s.setError);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setError(null), 4500);
    return () => clearTimeout(timer);
  }, [message, setError]);

  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 25,
        right: 25,
        background: "#d32f2f",
        color: "white",
        padding: "12px 18px",
        borderRadius: 6,
        fontSize: 15,
        boxShadow: "0px 4px 10px rgba(0,0,0,0.25)",
        zIndex: 99999,
      }}
    >
      {message}
    </div>
  );
}
