import { Navigate } from 'react-router-dom';
import { useRBAC } from '../../hooks/useRBAC';
import type { PortalModule, PortalPermission } from '../../types/rbac';

interface ProtectedRouteProps {
  module: PortalModule;
  required?: PortalPermission | PortalPermission[];
  children: React.ReactElement;
}

export function ProtectedRoute({ module, required, children }: ProtectedRouteProps) {
  const { canAccess } = useRBAC();
  if (!canAccess(module, required)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
