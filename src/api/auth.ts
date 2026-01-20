import api, { otpStart, otpVerify } from "./client";
import type { AuthenticatedUser } from "@/services/auth";

export { otpStart as startOtp, otpVerify as verifyOtp } from "./client";

export const fetchCurrentUser = () => api.get<AuthenticatedUser>("/auth/me");

export const logout = () => api.post<void>("/auth/logout");
