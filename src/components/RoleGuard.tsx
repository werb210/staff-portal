import { Navigate } from "react-router-dom";
import { getUserRole } from "../lib/auth";

interface Props {
  children: JSX.Element;
  allow: string[]; // allowed roles: ["admin", "staff", "lender", ...]
}

export default function RoleGuard({ children, allow }: Props) {
  const role = getUserRole();

  if (!role || !allow.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
