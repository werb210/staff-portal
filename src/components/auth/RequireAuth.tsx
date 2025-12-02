import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../state/authStore";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { token, user } = useAuthStore();

  if (!token || !user) return <Navigate to="/login" replace />;

  return children;
}
