/* ============================================================
   FILE: src/utils/api.ts
   PURPOSE: Centralized API utilities + health check export
   ============================================================ */

import { apiClient } from "@/api/client";
import { API_BASE } from "@/services/api";

export { API_BASE };

/* ============================================================
   REQUIRED LEGACY EXPORT — DO NOT REMOVE
   Used by src/App.tsx
   ============================================================ */
export async function checkStaffServerHealth(): Promise<boolean> {
  try {
    await apiClient.get("/_int/health", { skipAuth: true });
    return true;
  } catch {
    return false;
  }
}
