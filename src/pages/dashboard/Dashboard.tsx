import PipelineOverview from "@/components/dashboard/PipelineOverview";
import UrgentActions from "@/components/dashboard/UrgentActions";
import DocumentHealth from "@/components/dashboard/DocumentHealth";
import LenderActivity from "@/components/dashboard/LenderActivity";
import OfferFeed from "@/components/dashboard/OfferFeed";
import DealMetrics from "@/components/dashboard/DealMetrics";

const Dashboard = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <PipelineOverview />
        <UrgentActions />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <DocumentHealth />
        <LenderActivity />
      </div>
      <OfferFeed />
      <DealMetrics />
    </div>
  );
};

export default Dashboard;
