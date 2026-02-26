import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function AuthGuard({ children }: { children: JSX.Element }) {
  const { authState, isHydratingSession, isAuthenticated } = useAuth();

  if (authState === "loading" || isHydratingSession) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
