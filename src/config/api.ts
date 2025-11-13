// ==========================================================
// src/config/api.ts
// Central API configuration for Staff Portal
// - Axios instance
// - Base URL handling
// - Auth token injection
// - Error normalization
// ==========================================================

import axios from "axios";

// ----------------------------------------------------------
// Detect backend base URL (local dev vs production)
// ----------------------------------------------------------
const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  window.__STAFF_API_URL__ ??
  "https://staff-api.boreal.financial/api";

// ----------------------------------------------------------
// Create Axios instance
// ----------------------------------------------------------
export const apiClient = axios.create({
  baseURL: API_BASE_URL.replace(/\/$/, ""), // remove trailing slash
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// ----------------------------------------------------------
// Inject JWT token into every request
// ----------------------------------------------------------
apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("authToken") ??
    sessionStorage.getItem("authToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ----------------------------------------------------------
// Normalize API errors
// ----------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      "Unexpected API error";

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
