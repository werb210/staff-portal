import { useEffect, useState } from "react";
import api from "@/core/apiClient";

export default function MayaStatus() {
  const [status, setStatus] = useState<string>("degraded");

  useEffect(() => {
    api.get("/health").then((res) => {
      setStatus((res.data as { maya?: string })?.maya ?? "degraded");
    });
  }, []);

  const healthy = status === "healthy" || status === "ok";

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${
        healthy ? "bg-emerald-600" : "bg-red-600"
      }`}
    >
      Maya: {healthy ? "Healthy" : "Degraded"}
    </span>
  );
}
