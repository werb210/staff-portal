import { Navigate } from "react-router-dom"
import { useAuth } from "@/auth/AuthContext"

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const { status, authState, authStatus, rolesStatus, authReady, isAuthenticated } = useAuth()

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

  return <>{children}</>
}
