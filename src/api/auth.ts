import { apiClient } from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Staff' | 'Lender';
  permissions?: string[];
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
  return data;
};

export const getCurrentUser = async (): Promise<AuthUser> => {
  const { data } = await apiClient.get<AuthUser>('/auth/me');
  return data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};
