import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/auth/AuthContext"
import AccessRestricted from "@/components/auth/AccessRestricted"
import { roleIn, type Role } from "@/auth/roles"

export default function RequireAuth({ children, allowedRoles }: { children?: React.ReactNode; allowedRoles?: Role[] } = {}) {
  const { status, isAuthenticated, role } = useAuth()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !roleIn(role, allowedRoles)) {
    return <AccessRestricted requiredRoles={allowedRoles} />
  }

  return children ? <>{children}</> : <Outlet />
}
