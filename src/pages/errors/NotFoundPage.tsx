import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="p-12 text-center space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-4">404 — Page Not Found</h1>
        <p className="text-gray-700">This page does not exist.</p>
      </div>
      <Link
        to="/dashboard"
        className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
