// server/src/router/guards.tsx
import ProtectedRoute from "@/auth/ProtectedRoute";

export function Protected({ children }: { children: JSX.Element }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
