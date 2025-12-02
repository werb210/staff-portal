import { useEffect } from 'react';
import { useAuthStore } from '../state/authStore';

export function useAuthInit() {
  const restore = useAuthStore((s) => s.restore);

  useEffect(() => {
    restore();
  }, [restore]);
}
