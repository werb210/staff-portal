import { ReactNode, useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const TOKEN_KEY = "accessToken";

type Role = "admin" | "staff" | "marketing" | "lender" | "referrer";

interface ProtectedRouteProps {
  allow?: Role[];
  children?: ReactNode;
}

interface TokenPayload {
  exp?: number;
  role?: Role;
}

const decodeToken = (token: string): TokenPayload | null => {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    return decoded as TokenPayload;
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
};

const isExpired = (payload: TokenPayload | null) => {
  if (!payload?.exp) return true;
  const now = Date.now() / 1000;
  return payload.exp < now;
};

export const ProtectedRoute = ({ allow, children }: ProtectedRouteProps) => {
  const location = useLocation();
  const token = localStorage.getItem(TOKEN_KEY);

  const payload = useMemo(() => (token ? decodeToken(token) : null), [token]);

  if (!token || !payload || isExpired(payload)) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allow && payload.role && !allow.includes(payload.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
