import { api } from "./client";

export const http = {
  get: (path: string) => api(path),
  post: (path: string, body: Record<string, unknown> = {}) =>
    api(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  put: (path: string, body: Record<string, unknown> = {}) =>
    api(path, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  del: (path: string) =>
    api(path, {
      method: "DELETE",
    }),
};
