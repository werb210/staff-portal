import { useParams } from "react-router-dom";
import DocumentPanel from "@/features/documents/DocumentPanel";

export default function DocumentDetailsPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) return <div className="p-6 text-red-600">Document ID is required.</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Review</h1>
        <p className="text-gray-600">Review and manage uploaded documents.</p>
      </div>
      <DocumentPanel documentId={id} />
    </div>
  );
}
