import { Navigate } from "react-router-dom";
import { getToken, getRole } from "../lib/storage";

interface Props {
  children: JSX.Element;
  role?: string; // optional restriction
}

export default function ProtectedRoute({ children, role }: Props) {
  const token = getToken();
  const userRole = getRole();

  if (!token) return <Navigate to="/login" replace />;

  if (role && userRole !== role) return <Navigate to="/unauthorized" replace />;

  return children;
}
