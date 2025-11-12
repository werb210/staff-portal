import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

export function useAuth() {
  const { user, status, token, hydrate, hydrated, setStatus, setUser, clear } = useAuthStore();

  useEffect(() => {
    if (!hydrated && status === 'idle') {
      hydrate();
    }
  }, [hydrate, hydrated, status]);

  useEffect(() => {
    if (!hydrated) return;

    if (status === 'idle') {
      setStatus(token ? 'loading' : 'unauthenticated');
      return;
    }

    if (status !== 'loading') return;

    const fetchProfile = async () => {
      try {
        const profile = await authService.fetchProfile();
        setUser(profile);
        setStatus('authenticated');
      } catch (error) {
        console.warn('Unable to fetch staff profile, requiring login', error);
        clear();
        setStatus('unauthenticated');
      }
    };

    void fetchProfile();
  }, [clear, hydrated, setStatus, setUser, status, token]);

  return { user, status };
}
