import RequireAuth from "@/components/auth/RequireAuth";

export function Protected({ children }: { children: JSX.Element }) {
  return <RequireAuth>{children}</RequireAuth>;
}
