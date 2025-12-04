import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [app, setApp] = useState<any>(null);

  useEffect(() => {
    api.get(`/applications/${id}`).then(res => setApp(res.data));
  }, [id]);

  if (!app) return <p>Loading...</p>;

  return (
    <div>
      <h1>Application Details</h1>
      <p>Business: {app.businessName}</p>
      <p>Status: {app.status}</p>
    </div>
  );
}
