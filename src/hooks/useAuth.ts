import { useAuth as useAuthContext } from "@/auth/AuthContext"

export const useAuth = () => {
  const ctx = useAuthContext()

  return {
    // state
    user: ctx.user,
    accessToken: ctx.accessToken,
    isAuthenticated: ctx.isAuthenticated,
    isLoading: ctx.isLoading,
    authStatus: ctx.authStatus,
    rolesStatus: ctx.rolesStatus,
    authReady: ctx.authReady,
    error: ctx.error,
    pendingPhoneNumber: ctx.pendingPhoneNumber,

    // actions
    startOtp: ctx.startOtp,
    verifyOtp: ctx.verifyOtp,
    loginWithOtp: ctx.loginWithOtp,
    login: ctx.login,
    logout: ctx.logout,
    clearAuth: ctx.clearAuth,
  }
}
