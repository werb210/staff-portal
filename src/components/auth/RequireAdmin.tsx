import RequireRole from "./RequireRole";

export default function RequireAdmin({ children }: { children: JSX.Element }) {
  return <RequireRole role="admin">{children}</RequireRole>;
}
