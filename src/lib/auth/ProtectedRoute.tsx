import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6 text-center">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};
