import axios, { type AxiosRequestHeaders } from 'axios';
import { withAuth, onTokenChange } from './auth';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const headers = (config.headers ?? {}) as AxiosRequestHeaders;
  config.headers = withAuth(headers);
  return config;
});

// Reapply auth headers when token updates
onTokenChange((token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
});

export default api;
