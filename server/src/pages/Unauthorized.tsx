import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Unauthorized</h1>
      <p>You do not have permission to access this page.</p>
      <p>
        <Link to="/">Go back to dashboard</Link>
      </p>
    </div>
  );
}
