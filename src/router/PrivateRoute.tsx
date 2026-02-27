import { Navigate } from "react-router-dom"
import { useAuth } from "@/auth/AuthContext"
import AccessRestricted from "@/components/auth/AccessRestricted"
import { roleIn, type Role } from "@/auth/roles"

export default function PrivateRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: Role[]
}) {
  const { status, authState, authStatus, rolesStatus, authReady, isAuthenticated, role } = useAuth()

  const isLoading =
    status === "loading" ||
    authState === "loading" ||
    authStatus === "loading" ||
    rolesStatus === "loading" ||
    !authReady

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !roleIn(role, allowedRoles)) {
    return <AccessRestricted requiredRoles={allowedRoles} />
  }

  return <>{children}</>
}
