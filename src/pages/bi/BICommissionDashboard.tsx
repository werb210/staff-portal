import { useEffect, useMemo, useState } from "react";
import { useSilo } from "../../context/SiloContext";
import { createApi } from "../../api/apiFactory";
import { useAuth } from "../../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

interface CommissionDatum {
  name: string;
  commission: number;
}

interface CommissionResponse {
  application_id: string;
  commission_amount?: string | number | null;
}

export default function BICommissionDashboard() {
  const { silo } = useSilo();
  const { token } = useAuth();
  const api = useMemo(() => createApi(silo, token ?? ""), [silo, token]);

  const [data, setData] = useState<CommissionDatum[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await api.get<CommissionResponse[]>("/admin/commissions");

      const grouped = data.map((c) => ({
        name: c.application_id.slice(0, 6),
        commission: Number(c.commission_amount || 0)
      }));

      setData(grouped);
    }

    void load();
  }, [api]);

  return (
    <div style={{ width: "100%", height: 400 }}>
      <h2>Recurring Commission Overview</h2>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid stroke="#444" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="commission" fill="#00bcd4" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
