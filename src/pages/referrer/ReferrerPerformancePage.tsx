import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSkeleton } from "@/ui/skeletons";

export default function ReferrerPerformancePage() {
  const query = useQuery({
    queryKey: ["referrer-performance"],
    queryFn: async () => {
      const res = await axios.get("/api/referrers/performance");
      return res.data ?? {};
    },
  });

  if (query.isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium tracking-tight">Performance</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium tracking-tight">Performance summary</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm text-slate-700">{JSON.stringify(query.data, null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
