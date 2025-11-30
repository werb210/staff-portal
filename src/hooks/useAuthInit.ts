import { useEffect } from 'react';
import { useAuthStore } from '../state/authStore';
import { fetchCurrentUser } from '../api/auth';
import { useSiloStore } from '../state/siloStore';
import { Silo } from '../state/siloStore';

export function useAuthInit() {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    async function run() {
      useAuthStore.setState({ loading: true });

      try {
        const data = await fetchCurrentUser();

        if (data?.user) {
          setUser(data.user);

          const allowed = data.user.silos || [];
          const roles = data.user.roles || {};

          useSiloStore.getState().setAllowed(allowed as Silo[]);
          useSiloStore.getState().setRoles(roles);

          // default silo
          if (allowed.length > 0) {
            useSiloStore.getState().setSilo(allowed[0] as Silo);
          }
        } else {
          setUser(null);
        }
      } catch (_) {
        setUser(null);
      } finally {
        useAuthStore.setState({ loading: false });
      }
    }

    if (!user) run();
  }, [user, setUser]);
}
