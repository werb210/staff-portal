// src/pages/NotFoundPage.tsx
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Page not found</h1>
      <p style={{ marginBottom: 24 }}>
        The page you are looking for does not exist or you do not have access.
      </p>
      <Link to="/dashboard">Back to dashboard</Link>
    </div>
  );
}
