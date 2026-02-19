import { Navigate, useLocation } from "react-router-dom";
import { clearAuth, getAccessToken, isTokenExpired } from "@/lib/authStorage";

export default function AuthGuard({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const token = getAccessToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isTokenExpired(token)) {
    clearAuth();
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
