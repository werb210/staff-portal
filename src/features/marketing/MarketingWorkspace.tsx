import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/client";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </Card>
  );
}

export default function MarketingWorkspace() {
  const analyticsQuery = useQuery({
    queryKey: ["marketing-analytics"],
    queryFn: async () => (await api.get("/api/marketing/analytics")).data,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Workspace</h1>
          <p className="text-gray-600">Centralize campaigns, ads, and AI writer tools.</p>
        </div>
        <Button variant="secondary">New campaign</Button>
      </div>

      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>
        <TabsContent value="analytics">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Stat label="Opens" value={analyticsQuery.data?.opens ?? "—"} />
            <Stat label="Clicks" value={analyticsQuery.data?.clicks ?? "—"} />
            <Stat label="Reply rate" value={`${analyticsQuery.data?.replies ?? "—"}%`} />
            <Stat label="Stage progression" value={analyticsQuery.data?.progression ?? "—"} />
            <Stat label="Cost per lead" value={`$${analyticsQuery.data?.cpl ?? "—"}`} />
            <Stat label="Cost per funded deal" value={`$${analyticsQuery.data?.cpf ?? "—"}`} />
          </div>
        </TabsContent>
        <TabsContent value="tools">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="p-4">
              <p className="font-semibold">AI Writer</p>
              <p className="text-sm text-slate-600">Generate outreach, drip sequences, and rewrites.</p>
              <Button className="mt-3" asChild>
                <a href="/marketing/ai-writer">Open writer</a>
              </Button>
            </Card>
            <Card className="p-4">
              <p className="font-semibold">Campaign Builder</p>
              <p className="text-sm text-slate-600">Trigger multi-step workflows.</p>
              <Button className="mt-3" asChild>
                <a href="/marketing/campaigns">Open campaigns</a>
              </Button>
            </Card>
            <Card className="p-4">
              <p className="font-semibold">Ads Manager</p>
              <p className="text-sm text-slate-600">Manage Google, Meta, and LinkedIn ad stubs.</p>
              <Button className="mt-3" asChild>
                <a href="/marketing/ads">Open ads</a>
              </Button>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
