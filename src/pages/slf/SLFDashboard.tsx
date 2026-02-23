import { useEffect, useMemo, useState } from "react";
import { useSilo } from "../../context/SiloContext";
import { createApi } from "../../api/client";

export default function SLFDashboard() {
  const { silo } = useSilo();
  const api = useMemo(() => createApi(silo), [silo]);

  const [deals, setDeals] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await api.get("/deals");
      setDeals(res.data);
    }
    void load();
  }, [api]);

  return (
    <div>
      <h2>SLF Deals</h2>
      <pre>{JSON.stringify(deals, null, 2)}</pre>
    </div>
  );
}
