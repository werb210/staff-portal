import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { verifyToken } from "@/services/authService";
import { useSessionStore } from "@/store/sessionStore";
import LoadingOverlay from "../feedback/LoadingOverlay";

interface Props {
  allow?: ("admin" | "staff" | "marketing" | "lender" | "referrer")[];
  children?: React.ReactNode;
}

export const ProtectedRoute = ({ allow, children }: Props) => {
  const location = useLocation();
  const session = useSessionStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["session", session.token],
    queryFn: () => verifyToken(session.token),
    enabled: Boolean(session.token),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data?.user && data?.token) {
      session.setSession({ user: data.user, token: data.token, expiresAt: data.expiresAt ?? null });
    }
  }, [data, session]);

  useEffect(() => {
    session.hydrate();
  }, [session]);

  if (!session.token && !isLoading) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isLoading) return <LoadingOverlay message="Validating session" />;

  if (isError || !data?.user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allow && data.user.role && !allow.includes(data.user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
