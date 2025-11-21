import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const integrations = [
  { name: "Google Ads", description: "Connect and sync campaigns", provider: "google" },
  { name: "Meta Ads", description: "Manage Facebook/Instagram ads", provider: "meta" },
  { name: "LinkedIn Ads", description: "Sync LinkedIn outreach", provider: "linkedin" },
];

export default function MarketingAds() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ads Manager</h1>
        <p className="text-gray-600">Integration stubs for major ad networks.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {integrations.map((integration) => (
          <Card key={integration.provider} className="p-4 space-y-2">
            <p className="text-lg font-semibold">{integration.name}</p>
            <p className="text-sm text-slate-600">{integration.description}</p>
            <Button variant="secondary">Connect</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
