import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../state/authStore';
import { useAuthInit } from '../../hooks/useAuthInit';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  useAuthInit();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
