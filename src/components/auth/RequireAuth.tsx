import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useSiloStore, Silo } from '../../state/siloStore';

const DEFAULT_SILOS: Silo[] = ["BF", "BI", "SLF"];
const DEFAULT_ROLES: Record<Silo, string> = {
  BF: "STAFF",
  BI: "STAFF",
  SLF: "STAFF",
};

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const { currentSilo, allowedSilos, roles, setAllowed, setRoles, setSilo } = useSiloStore();

  useEffect(() => {
    if (!allowedSilos.length) {
      setAllowed(DEFAULT_SILOS);
    }

    if (Object.keys(roles).length === 0) {
      setRoles(DEFAULT_ROLES);
    }

    if (!currentSilo) {
      const targetSilo = (allowedSilos[0] as Silo) || DEFAULT_SILOS[0];
      setSilo(targetSilo);
    }
  }, [allowedSilos, currentSilo, roles, setAllowed, setRoles, setSilo]);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
