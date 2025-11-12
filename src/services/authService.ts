import apiClient from '../hooks/api/axiosClient';
import type { AuthResponse, LoginPayload, PasskeyPayload } from '../types/auth';
import type { StaffUser } from '../types/rbac';

function buildApiUrl(path: string) {
  const base = apiClient.defaults.baseURL ?? '';
  if (!base || base === '/') {
    return path;
  }
  return `${base.replace(/\/$/, '')}${path}`;
}

export const authService = {
  login: async (payload: LoginPayload) =>
    (await apiClient.post<AuthResponse>('/api/auth/login', payload)).data,
  loginWithPasskey: async (payload: PasskeyPayload) =>
    (await apiClient.post<AuthResponse>('/api/auth/passkey', payload)).data,
  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.warn('Logout endpoint unavailable, clearing local session only.', error);
    }
  },
  fetchProfile: async () => (await apiClient.get<StaffUser>('/api/staff/profile')).data,
  getOffice365OAuthUrl: () => buildApiUrl('/auth/oauth/office365'),
};
