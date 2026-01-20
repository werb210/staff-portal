import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

export default function AuthGuard({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const auth = useAuth();

  if (!auth.authReady) {
    return null;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
