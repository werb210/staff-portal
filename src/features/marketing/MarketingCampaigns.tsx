import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api/client";

export default function MarketingCampaigns() {
  const campaignsQuery = useQuery({
    queryKey: ["marketing-campaigns"],
    queryFn: async () => (await api.get("/api/marketing/campaigns")).data ?? [],
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Builder</h1>
          <p className="text-gray-600">Automate triggers and actions for outreach.</p>
        </div>
        <Button>New workflow</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {campaignsQuery.data?.map((campaign: any) => (
          <Card key={campaign.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{campaign.name}</p>
              <span className="text-xs text-slate-500">{campaign.triggers?.join(", ")}</span>
            </div>
            <p className="text-sm text-slate-600">Actions: {campaign.actions?.join(", ")}</p>
            <p className="text-sm text-slate-600">Status: {campaign.status ?? "draft"}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
