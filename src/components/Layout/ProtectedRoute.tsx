import { Navigate, useLocation } from 'react-router-dom';
import { useRBAC } from '../../hooks/useRBAC';
import type { PortalModule, PortalPermission } from '../../types/rbac';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  module: PortalModule;
  required?: PortalPermission | PortalPermission[];
  children: React.ReactElement;
}

export function ProtectedRoute({ module, required, children }: ProtectedRouteProps) {
  const { canAccess } = useRBAC();
  const { status } = useAuthStore();
  const location = useLocation();

  if (status !== 'authenticated') {
    return <Navigate to="/login" state={{ from: `${location.pathname}${location.search}` }} replace />;
  }

  if (!canAccess(module, required)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
