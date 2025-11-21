import apiClient from "../api";

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  perPage?: number;
  sort?: string;
}

export interface UserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  password?: string;
  status?: string;
}

export const listUsers = <T = unknown>(params?: UserFilters) =>
  apiClient.get<T>("/users", { params });

export const getUser = <T = unknown>(userId: string) =>
  apiClient.get<T>(`/users/${userId}`);

export const createUser = <T = unknown>(payload: UserPayload) =>
  apiClient.post<T>("/users", payload);

export const updateUser = <T = unknown>(userId: string, payload: Partial<UserPayload>) =>
  apiClient.patch<T>(`/users/${userId}`, payload);

export const disableUser = <T = unknown>(userId: string) =>
  apiClient.post<T>(`/users/${userId}/disable`);

export const enableUser = <T = unknown>(userId: string) =>
  apiClient.post<T>(`/users/${userId}/enable`);
