import { create } from 'zustand';
import type { PortalPermission, Silo, StaffUser } from '../types/rbac';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

interface AuthState {
  status: AuthStatus;
  user: StaffUser | null;
  setUser: (user: StaffUser) => void;
  setStatus: (status: AuthStatus) => void;
  clear: () => void;
}

const defaultPermissions: PortalPermission[] = [
  'applications:create',
  'applications:submit',
  'applications:upload',
  'applications:complete',
  'documents:review',
  'documents:update-status',
  'lenders:view',
  'lenders:send',
  'pipeline:view',
  'pipeline:transition',
  'communication:sms',
  'communication:email',
  'communication:call',
  'admin:retry-queue',
  'admin:backups',
  'ai:ocr',
  'ai:summarize',
  'ai:risk',
  'ai:lender-match',
];

export const useAuthStore = create<AuthState>((set) => ({
  status: 'idle',
  user: {
    id: 'placeholder-user',
    name: 'Portal User',
    email: 'user@example.com',
    role: 'manager',
    silo: 'BF' satisfies Silo,
    permissions: defaultPermissions,
  },
  setUser: (user) => set({ user, status: 'authenticated' }),
  setStatus: (status) => set({ status }),
  clear: () => set({ user: null, status: 'idle' }),
}));
