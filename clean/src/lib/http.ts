// LEGACY AUTH — DO NOT USE
// Replaced by unified auth system in src/lib/auth/
import apiClient from "./apiClient";

export const TOKEN_STORAGE_KEY = "bf_staff_token"; // deprecated – not used
export const setUnauthorizedHandler = () => {};

export default apiClient;
