import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import AppLoading from "@/components/layout/AppLoading";
import { useQuery } from "@tanstack/react-query";
import { fetchAttributionDashboard } from "@/api/marketing.attribution";
import { fetchAds } from "@/api/marketing.ads";
import { fetchAssets } from "@/api/marketing.assets";
import { useMarketingStore } from "@/state/marketing.store";
import AdsList from "./AdsManager/AdsList";
import ABTestingSuite from "./AdsManager/ABTestingSuite";
import CampaignList from "./Campaigns/CampaignList";
import CampaignAnalytics from "./Campaigns/CampaignAnalytics";
import BulkEmailComposer from "./BulkMessaging/BulkEmailComposer";
import BulkSMSComposer from "./BulkMessaging/BulkSMSComposer";
import AttributionDashboard from "./Attribution/AttributionDashboard";
import RetargetingRules from "./Retargeting/RetargetingRules";
import RetargetingAudienceList from "./Retargeting/RetargetingAudienceList";
import BrandLibrary from "./Assets/BrandLibrary";
import MarketingToDoList from "./ToDo/MarketingToDoList";

const MarketingDashboard = () => {
  const { dateRange } = useMarketingStore();
  const { data: attribution, isLoading: loadingAttribution } = useQuery({
    queryKey: ["attribution", dateRange],
    queryFn: () => fetchAttributionDashboard(dateRange)
  });
  const { data: ads } = useQuery({ queryKey: ["ads-dashboard"], queryFn: fetchAds });
  const { data: assets } = useQuery({ queryKey: ["assets"], queryFn: fetchAssets });

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="AI Insights">
          <ul className="list-disc pl-5 space-y-2">
            <li>Increase Google Ads budget by $1,000 — funded-deal conversion trending 12%.</li>
            <li>Pause underperforming Meta ad creative — CPC is 35% higher than Google.</li>
            <li>Retarget unfinished applications with SMS to recover 180 leads.</li>
            <li>Create new ad for healthcare practices highlighting 24-hour approvals.</li>
          </ul>
        </Card>
        <Card title="Performance Snapshot">
          {ads ? (
            <Table headers={["Platform", "Spend", "Impr.", "Clicks", "Conv.", "CPQA"]}>
              {ads.map((ad) => (
                <tr key={ad.id}>
                  <td>{ad.platform}</td>
                  <td>${ad.spend.toLocaleString()}</td>
                  <td>{ad.impressions.toLocaleString()}</td>
                  <td>{ad.clicks.toLocaleString()}</td>
                  <td>{ad.conversions.toLocaleString()}</td>
                  <td>
                    {ad.qualifiedApplications
                      ? `$${Math.round(ad.spend / ad.qualifiedApplications)}`
                      : "–"}
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <AppLoading />
          )}
        </Card>
      </div>

      <CampaignAnalytics />
      <CampaignList />
      <AdsList />
      <ABTestingSuite />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BulkEmailComposer />
        <BulkSMSComposer />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RetargetingRules />
        <RetargetingAudienceList />
      </div>

      <AttributionDashboard data={attribution} loading={loadingAttribution} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BrandLibrary assets={assets} />
        <MarketingToDoList />
      </div>
    </div>
  );
};

export default MarketingDashboard;
