import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApplication, Application } from "@/api/applications";

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      try {
        const data = await getApplication(id);
        setApplication(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (!id) return <div>Missing application id.</div>;
  if (loading) return <div>Loading application…</div>;
  if (!application) return <div>Application not found.</div>;

  const anyApp = application as any;

  return (
    <div>
      <h1>Application {application.id}</h1>

      <section>
        <h2>Basic Info</h2>
        <p><strong>Company:</strong> {anyApp.companyName ?? ""}</p>
        <p><strong>Status:</strong> {application.status}</p>
        <p><strong>Requested Amount:</strong> {anyApp.requestedAmount ? `$${anyApp.requestedAmount}` : "—"}</p>
        <p><strong>Created:</strong> {new Date(application.createdAt).toLocaleString()}</p>
      </section>

      <section>
        <h2>Use of Funds</h2>
        <p>{anyApp.useOfFunds ?? "—"}</p>
      </section>

      <section>
        <h2>Notes</h2>
        <p>{anyApp.internalNotes ?? "—"}</p>
      </section>
    </div>
  );
}
