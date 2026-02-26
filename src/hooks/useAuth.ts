import { useAuth as useAuthContext } from "@/auth/AuthContext"

export const useAuth = () => {
  const ctx = useAuthContext()

  return {
    // New contract
    user: ctx.user,
    accessToken: ctx.accessToken,
    status: ctx.status,
    isAuthenticated: ctx.isAuthenticated,
    isLoading: ctx.isLoading,
    authReady: ctx.authReady,

    login: ctx.login,
    logout: ctx.logout,
    clearAuth: ctx.clearAuth,

    // ---- LEGACY COMPATIBILITY FIELDS ----
    authStatus: ctx.status,
    rolesStatus: "ready",

    authenticated: ctx.isAuthenticated,

    error: undefined,
    pendingPhoneNumber: undefined,

    startOtp: async () => {
      throw new Error("OTP flow removed from portal")
    },

    verifyOtp: async () => {
      throw new Error("OTP flow removed from portal")
    },

    loginWithOtp: async () => {
      throw new Error("OTP flow removed from portal")
    },
  }
}
