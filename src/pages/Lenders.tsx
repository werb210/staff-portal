import { useEffect, useState } from "react";
import api from "../api/client";

export function Lenders() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLenders = async () => {
      try {
        await api.get("/api/lenders");
      } catch {
        setError("Unable to load lenders");
      }
    };

    void loadLenders();
  }, []);

  if (error) return <div>{error}</div>;
  return <div>Lenders</div>;
}
