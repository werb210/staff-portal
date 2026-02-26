import { Navigate } from "react-router-dom"
import { useAuth } from "@/auth/AuthContext"

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const { status, isAuthenticated } = useAuth()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
