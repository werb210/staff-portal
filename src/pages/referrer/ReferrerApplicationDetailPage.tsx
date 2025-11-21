import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSkeleton } from "@/ui/skeletons";

export default function ReferrerApplicationDetailPage() {
  const { id } = useParams();

  const query = useQuery({
    queryKey: ["referrer-application", id],
    queryFn: async () => {
      const res = await axios.get(`/api/referrers/applications/${id}`);
      return res.data ?? {};
    },
    enabled: Boolean(id),
  });

  if (query.isLoading) return <PageSkeleton />;

  const app = query.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium tracking-tight">{app.referralName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-slate-700">
        <div className="flex justify-between">
          <span className="font-medium">Stage</span>
          <span>{app.stage}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Amount</span>
          <span>{app.amount}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Status</span>
          <span>{app.status}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Commission</span>
          <span>{app.commission}</span>
        </div>
      </CardContent>
    </Card>
  );
}
