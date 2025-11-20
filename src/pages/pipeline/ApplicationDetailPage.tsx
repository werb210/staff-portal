import { useParams } from "react-router-dom";

export default function ApplicationDetailPage() {
  const { id } = useParams();

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold">Application {id}</h2>
      <p className="text-slate-600">Detailed view for application {id}.</p>
    </div>
  );
}
