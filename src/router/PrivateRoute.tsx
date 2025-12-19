import { Outlet } from "react-router-dom";

interface PrivateRouteProps {
  children?: JSX.Element;
  allowedRoles?: string[];
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  return children ?? <Outlet />;
}
