import { useEffect, useState } from "react";
import { useSilo } from "../../context/SiloContext";
import { createApi } from "../../api/client";

interface Deal {
  id: string;
  status: "received" | "processing" | "completed" | string;
  external_id: string;
  product_family: string;
}

export default function SLFPipeline() {
  const { silo } = useSilo();
  const api = createApi(silo);

  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    async function load() {
      const res = await api.get<Deal[]>("/deals");
      setDeals(res.data);
    }

    void load();
  }, [api]);

  const columns = ["received", "processing", "completed"] as const;

  return (
    <div style={{ display: "flex", gap: 20 }}>
      {columns.map((col) => (
        <div key={col} style={{ flex: 1 }}>
          <h3>{col.toUpperCase()}</h3>
          {deals
            .filter((d) => d.status === col)
            .map((deal) => (
              <div
                key={deal.id}
                style={{
                  background: "#0f172a",
                  padding: 12,
                  marginBottom: 10,
                  borderRadius: 6
                }}
              >
                <strong>{deal.external_id}</strong>
                <div>{deal.product_family}</div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
