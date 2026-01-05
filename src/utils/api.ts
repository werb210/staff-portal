/* ============================================================
   FILE: src/utils/api.ts
   PURPOSE: Centralized API utilities + health check export
   ============================================================ */

import { apiFetch } from "@/services/api";

export { API_BASE, apiFetch } from "@/services/api";

/* ============================================================
   REQUIRED LEGACY EXPORT — DO NOT REMOVE
   Used by src/App.tsx
   ============================================================ */
export async function checkStaffServerHealth(): Promise<boolean> {
  try {
    await apiFetch("/_int/health", { skipAuth: true });
    return true;
  } catch {
    return false;
  }
}
