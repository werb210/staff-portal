import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

type ProtectedRouteProps = {
  children?: JSX.Element;
  allow?: string[];
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, loading } = useAuth();

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;

  return children ?? <Outlet />;
}

export default ProtectedRoute;
