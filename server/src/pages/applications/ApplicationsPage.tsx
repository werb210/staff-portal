import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listApplications, Application } from "@/api/applications";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const data = await listApplications();
      setApplications(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1>Applications</h1>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Company</th>
              <th>Status</th>
              <th>Requested</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => (
              <tr
                key={a.id}
                onClick={() => navigate(`/applications/${a.id}`)}
                style={{ cursor: "pointer" }}
              >
                <td>{a.id}</td>
                <td>{(a as any).companyName ?? ""}</td>
                <td>{a.status}</td>
                <td>{(a as any).requestedAmount ? `$${(a as any).requestedAmount}` : ""}</td>
                <td>{new Date(a.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
