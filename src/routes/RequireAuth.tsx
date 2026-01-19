import { Navigate } from "react-router-dom";
import { getAccessToken } from "../auth/auth.store";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const token = getAccessToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
