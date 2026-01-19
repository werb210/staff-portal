import { Navigate, useLocation } from "react-router-dom";
import { getStoredAccessToken } from "@/services/token";

function decodeJwt(token: string) {
  const [, payload] = token.split(".");
  if (!payload) throw new Error("bad token");
  JSON.parse(atob(payload));
}

export default function AuthGuard({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const token = getStoredAccessToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  try {
    decodeJwt(token);
  } catch {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
