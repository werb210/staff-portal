import axios, { AxiosHeaders } from 'axios';
import { useAuthStore } from '../../store/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const { token, user } = useAuthStore.getState();
  const headers = config.headers instanceof AxiosHeaders ? config.headers : AxiosHeaders.from(config.headers ?? {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (user?.silo) {
    headers.set('X-Silo', user.silo);
  }
  config.headers = headers;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!navigator.onLine) {
      console.warn('Request failed while offline:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
