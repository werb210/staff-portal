import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token, loading } = useAuth();

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;
