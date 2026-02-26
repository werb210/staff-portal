import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/auth/AuthContext"

export default function RequireAuth() {
  const { status, isAuthenticated } = useAuth()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
