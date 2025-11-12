import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

interface ProtectedRouteProps {
  redirectTo?: string;
  allowedRoles?: Array<'Admin' | 'Staff' | 'Lender'>;
}

export const ProtectedRoute = ({ redirectTo = '/login', allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <div className="page-loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
