import React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const { authenticated, status } = useAuth()

  if (status === "pending") {
    return <div>Loading secure content</div>
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
