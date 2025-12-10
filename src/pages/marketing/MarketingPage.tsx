import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import { useAuth } from "@/hooks/useAuth";
import { canAccessMarketing } from "@/utils/roles";
import { useQuery } from "@tanstack/react-query";
import AppLoading from "@/components/layout/AppLoading";
import { fetchCampaigns } from "@/api/marketing";

const MarketingPage = () => {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ["campaigns"], queryFn: fetchCampaigns, enabled: canAccessMarketing(user?.role) });

  const unauthorized = user && !canAccessMarketing(user.role);

  return (
    <div className="page">
      <Card title="Marketing">
        {unauthorized && <p>This space is limited to Administrators.</p>}
        {!unauthorized && (
          <>
            {isLoading && <AppLoading />}
            {!isLoading && (
              <Table headers={["Campaign", "Status"]}>
                {data?.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>{campaign.name}</td>
                    <td>{campaign.status}</td>
                  </tr>
                ))}
                {!data?.length && (
                  <tr>
                    <td colSpan={2}>No campaigns found.</td>
                  </tr>
                )}
              </Table>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default MarketingPage;
