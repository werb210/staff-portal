import { Navigate } from "react-router-dom";
import { getAuthToken, decodeJwt } from "@/auth/token";

export function AuthGuard({ children }: { children: JSX.Element }) {
  const token = getAuthToken();
  const decoded = decodeJwt(token);

  if (!token || !decoded) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
