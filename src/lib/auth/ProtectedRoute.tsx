import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./useAuthStore";

interface Props {
  children: JSX.Element;
  allow?: string[];
}

export const ProtectedRoute = ({ children, allow }: Props) => {
  const location = useLocation();
  const { token, user } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allow && !allow.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};
