import { useParams, Link } from "react-router-dom";

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();

  // For now just show the ID; later we can call a /api/applications/:id endpoint
  return (
    <div className="bf-page">
      <h1 className="bf-page-title">Application Detail</h1>
      <p>Application ID: {id}</p>
      <p>
        <Link to="/applications">&larr; Back to Applications</Link>
      </p>
    </div>
  );
}
