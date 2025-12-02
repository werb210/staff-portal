import RequireAuth from "../components/auth/RequireAuth";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  return <RequireAuth>{children}</RequireAuth>;
}
