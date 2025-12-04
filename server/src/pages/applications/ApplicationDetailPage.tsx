import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ApplicationsAPI } from "@/api/applications";

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["application-detail", id],
    queryFn: () => ApplicationsAPI.getById(id!),
    enabled: !!id,
  });

  if (!id) return <div>Missing application id</div>;
  if (isLoading) return <div>Loading application...</div>;

  const app = data;

  if (!app) return <div>Application not found</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">
        Application {app.id} — {app.businessName}
      </h1>

      <div className="space-y-2 text-sm">
        <div>Status: {app.status}</div>
        <div>Requested Amount: ${app.requestedAmount}</div>
        <div>Product: {app.productType}</div>
      </div>
    </div>
  );
}
