import type { AxiosRequestHeaders } from 'axios';

const TOKEN_KEY = 'staff_portal_token';

type Subscriber = (token: string | null) => void;

const subscribers: Subscriber[] = [];

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  subscribers.forEach((subscriber) => subscriber(token));
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  subscribers.forEach((subscriber) => subscriber(null));
}

export function onTokenChange(callback: Subscriber) {
  subscribers.push(callback);
  return () => {
    const index = subscribers.indexOf(callback);
    if (index !== -1) {
      subscribers.splice(index, 1);
    }
  };
}

export function withAuth(headers: AxiosRequestHeaders = {} as AxiosRequestHeaders) {
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}
