import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="space-y-3 text-center">
      <h2 className="text-3xl font-semibold text-slate-900">Page not found</h2>
      <p className="text-slate-600">The page you are looking for doesn&apos;t exist.</p>
      <Link
        to="/"
        className="inline-block rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
