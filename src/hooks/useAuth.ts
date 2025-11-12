import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import apiClient from './api/axiosClient';
import type { StaffUser } from '../types/rbac';

export function useAuth() {
  const { user, status, setStatus, setUser } = useAuthStore();

  useEffect(() => {
    if (status !== 'idle') return;
    const fetchProfile = async () => {
      try {
        setStatus('loading');
        const { data } = await apiClient.get<StaffUser>('/api/staff/profile');
        setUser(data);
      } catch (error) {
        console.warn('Falling back to default portal user', error);
        setStatus('authenticated');
      }
    };

    void fetchProfile();
  }, [setStatus, setUser, status]);

  return { user, status };
}
