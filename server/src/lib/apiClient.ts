const API = import.meta.env.VITE_API_BASE_URL;

export const api = {
  url: (path: string) => `${API}${path}`
};
