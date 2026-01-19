import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const auth = useAuth();

  if (auth.status === "loading") {
    return null; // wait for hydration
  }

  if (auth.status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
