import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/state/authStore";

type Props = {
  children: JSX.Element;
};

export default function RequireAuth({ children }: Props) {
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const location = useLocation();

  if (!isHydrated) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
