import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/state/authStore";

type Props = {
  children: JSX.Element;
};

export default function RequireAdmin({ children }: Props) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin" && user.role !== "superadmin") {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
