import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await api.get("/api/applications");
      return res.data;
    }
  });

  if (isLoading) return <p className="p-6">Loading…</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Applications</h1>

      <div className="space-y-3">
        {data.map((app: any) => (
          <div key={app.id} className="border p-4 rounded">
            <p className="font-bold">{app.businessName}</p>
            <p className="text-sm text-gray-600">{app.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
