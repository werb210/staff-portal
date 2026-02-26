import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  children: JSX.Element;
  requiredRoles?: string[];
};

export default function AuthGuard({ children, requiredRoles }: Props) {
  const { authStatus, authenticated, roles } = useAuth();

  if (authStatus === "loading" || authStatus === "pending") {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = roles?.some((r) => requiredRoles.includes(r));
    if (!hasRole) {
      return <div>Access restricted</div>;
    }
  }

  return children;
}
