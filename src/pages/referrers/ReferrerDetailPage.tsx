import { useParams } from "react-router-dom";

export default function ReferrerDetailPage() {
  const { id } = useParams();

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold">Referrer {id}</h2>
      <p className="text-slate-600">Detail view for referrer {id}.</p>
    </div>
  );
}
