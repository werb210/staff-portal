// src/components/GlobalLoader.tsx
import { useGlobalLoading } from "../hooks/useGlobalLoading";
import LoadingSpinner from "./LoadingSpinner";

export default function GlobalLoader() {
  const loading = useGlobalLoading((s) => s.loading);

  if (!loading) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(2px)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <LoadingSpinner />
    </div>
  );
}
