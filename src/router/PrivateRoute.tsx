import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import AppLoading from "@/components/layout/AppLoading";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const { status } = useAuth();

  if (status === "loading") return <AppLoading />;
  if (status === "unauthenticated") return <Navigate to="/login" replace />;

  return children;
}
