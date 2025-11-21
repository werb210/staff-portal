import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../lib/auth/useAuthStore";

interface Props {
  children: JSX.Element;
  roles?: string[];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { token, user } = useAuthStore();

  // Not authenticated
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role restricted
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
