import { useParams } from "react-router-dom";
import { useApplicationFull } from "@/features/applications/hooks/useApplication";

export default function ApplicationViewPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useApplicationFull(id!);

  if (isLoading) return <p className="p-4">Loading…</p>;
  if (error) return <p className="p-4 text-red-600">Failed to load</p>;
  if (!data) return <p className="p-4">Application not found.</p>;

  const app = data;

  return (
    <div className="p-6">
      <h1 className="text-2xl">Application #{app.id}</h1>

      <div className="mt-6 bg-white p-6 shadow rounded">
        <p><strong>Business:</strong> {app.businessName}</p>
        <p><strong>Status:</strong> {app.status}</p>
        <p><strong>Use of Funds:</strong> {app.useOfFunds}</p>
        <p><strong>Created:</strong> {new Date(app.createdAt).toLocaleString()}</p>

        <h2 className="text-xl mt-6 mb-2">Applicant</h2>
        <p><strong>Name:</strong> {app.applicantName}</p>
        <p><strong>Email:</strong> {app.applicantEmail}</p>
        <p><strong>Phone:</strong> {app.applicantPhone}</p>

        <h2 className="text-xl mt-6 mb-2">Documents</h2>
        {app.documents?.length === 0 && <p>No documents uploaded.</p>}
        <ul className="list-disc ml-6">
          {app.documents?.map((doc: { id: string; fileName: string; category?: string }) => (
            <li key={doc.id}>
              {doc.fileName} ({doc.category})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
