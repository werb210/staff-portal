import axios from "axios";
import { API_BASE_URL, API_TIMEOUT } from "../config/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Portal API error:", error?.response || error);
    return Promise.reject(error);
  }
);
