import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
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
