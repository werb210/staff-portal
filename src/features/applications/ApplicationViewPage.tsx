import { useParams } from "react-router-dom";
import { useApplication } from "./useApplications";

export default function ApplicationViewPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useApplication(id || "");

  if (isLoading) return <div>Loading application…</div>;
  if (error) return <div className="text-red-600">Failed to load application.</div>;
  if (!data) return null;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">
        Application: {data.businessName}
      </h1>

      <div className="bg-white shadow border rounded-lg p-6 space-y-4">
        <p><strong>Business Name:</strong> {data.businessName}</p>
        <p><strong>Contact Name:</strong> {data.contactName}</p>
        <p><strong>Email:</strong> {data.email}</p>
        <p><strong>Status:</strong> {data.status}</p>
        <p><strong>Created At:</strong> {new Date(data.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
