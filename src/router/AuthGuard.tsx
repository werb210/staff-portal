import { Navigate, useLocation } from "react-router-dom";
import { getStoredAccessToken } from "@/services/token";
import { decodeJwt } from "@/utils/jwt";

export default function AuthGuard({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const token = getStoredAccessToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    decodeJwt(token);
  } catch {
    return <Navigate to="/login" replace />;
  }

  return children;
}
