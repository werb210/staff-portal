import RequireAuth from "@/auth/ProtectedRoute";

export function Protected({ children }: { children: JSX.Element }) {
  return <RequireAuth>{children}</RequireAuth>;
}
