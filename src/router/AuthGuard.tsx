import { Navigate, useLocation } from "react-router-dom";
import { getAccessToken } from "@/lib/authToken";

export default function AuthGuard({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const token = getAccessToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
