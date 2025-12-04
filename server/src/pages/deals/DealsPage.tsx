import { useEffect, useState } from "react";
import { fetchDeals } from "@/lib/api/deals";

export default function DealsPage() {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    fetchDeals().then(setList).catch(console.error);
  }, []);

  return (
    <>
      <h1>Deals</h1>
      <ul>
        {list.map((d) => (
          <li key={d.id}>{d.name ?? "Deal"} — {d.status}</li>
        ))}
      </ul>
    </>
  );
}
