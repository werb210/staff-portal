import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const { status } = useAuth();

  if (status === "loading") return null;
  if (status === "unauthenticated") return <Navigate to="/login" replace />;

  return children;
}
