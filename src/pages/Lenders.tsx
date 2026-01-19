import { useEffect, useState } from "react";
import { fetchWithAuth } from "../api/fetchWithAuth";

export function Lenders() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWithAuth("/api/lenders")
      .then(async (res) => {
        if (!res.ok) {
          setError("Unable to load lenders");
          return;
        }
        // handle data
      })
      .catch(() => setError("Unable to load lenders"));
  }, []);

  if (error) return <div>{error}</div>;
  return <div>Lenders</div>;
}
