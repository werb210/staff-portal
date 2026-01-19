import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchLenderProfile,
  lenderLogin,
  sendLenderOtp,
  verifyLenderOtp,
  type LenderLoginPayload,
  type LenderProfile,
  type VerifyOtpPayload
} from "@/api/lender/auth";
import { configureLenderApiClient, type LenderAuthTokens } from "@/api/http";
import { canAccessLenderPortal } from "@/utils/roles";

export type LenderAuthContextValue = {
  user: LenderProfile | null;
  tokens: LenderAuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingEmail: string | null;
  pendingSessionId: string | null;
  login: (payload: LenderLoginPayload) => Promise<void>;
  triggerOtp: (email?: string) => Promise<void>;
  verifyOtp: (payload: VerifyOtpPayload) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = "lender-portal.auth";
const PENDING_KEY = "lender-portal.pending";

const readStoredAuth = (): { tokens: LenderAuthTokens | null; user: LenderProfile | null } => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { tokens: null, user: null };
    return JSON.parse(raw) as { tokens: LenderAuthTokens | null; user: LenderProfile | null };
  } catch (error) {
    return { tokens: null, user: null };
  }
};

const readPendingState = (): { email: string | null; sessionId: string | null } => {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return { email: null, sessionId: null };
    return JSON.parse(raw) as { email: string | null; sessionId: string | null };
  } catch (error) {
    return { email: null, sessionId: null };
  }
};

const persistAuth = (tokens: LenderAuthTokens | null, user: LenderProfile | null) => {
  if (!tokens) {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ tokens, user }));
};

const persistPending = (email: string | null, sessionId: string | null) => {
  if (!email && !sessionId) {
    sessionStorage.removeItem(PENDING_KEY);
    return;
  }
  sessionStorage.setItem(PENDING_KEY, JSON.stringify({ email, sessionId }));
};

const LenderAuthContext = createContext<LenderAuthContextValue | undefined>(undefined);

export const LenderAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [tokens, setTokens] = useState<LenderAuthTokens | null>(() => readStoredAuth().tokens);
  const [user, setUser] = useState<LenderProfile | null>(() => readStoredAuth().user);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState<string | null>(() => readPendingState().email);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(() => readPendingState().sessionId);

  const logout = useCallback(() => {
    setTokens(null);
    setUser(null);
    setPendingEmail(null);
    setPendingSessionId(null);
    persistAuth(null, null);
    persistPending(null, null);
  }, []);

  useEffect(() => {
    configureLenderApiClient({
      tokenProvider: () => tokens,
      onTokensUpdated: (nextTokens) => {
        setTokens(nextTokens);
        persistAuth(nextTokens, user);
      },
      onUnauthorized: logout
    });
  }, [tokens, user, logout]);

  const hydrateProfile = useCallback(async () => {
    if (!tokens || user) {
      setIsLoading(false);
      return;
    }
    try {
      const profile = await fetchLenderProfile();
      setUser(profile);
      persistAuth(tokens, profile);
    } catch (error) {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [tokens, user, logout]);

  useEffect(() => {
    hydrateProfile();
  }, [hydrateProfile]);

  const login = useCallback(async (payload: LenderLoginPayload) => {
    const response = await lenderLogin(payload);
    setPendingEmail(payload.email);
    setPendingSessionId(response.sessionId);
    persistPending(payload.email, response.sessionId);
  }, []);

  const triggerOtp = useCallback(async (email?: string) => {
    const targetEmail = email ?? pendingEmail;
    if (!targetEmail) return;
    await sendLenderOtp(targetEmail);
    setPendingEmail(targetEmail);
    persistPending(targetEmail, pendingSessionId);
  }, [pendingEmail, pendingSessionId]);

  const verifyOtpHandler = useCallback(
    async (payload: VerifyOtpPayload) => {
      const email = payload.email || pendingEmail;
      if (!email) {
        throw new Error("Missing email for OTP verification");
      }
      const response = await verifyLenderOtp({ ...payload, email, sessionId: pendingSessionId ?? payload.sessionId });
      const nextTokens: LenderAuthTokens = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      };
      setTokens(nextTokens);
      setUser(response.user);
      setPendingEmail(null);
      setPendingSessionId(null);
      persistAuth(nextTokens, response.user);
      persistPending(null, null);
    },
    [pendingEmail, pendingSessionId]
  );

  const value = useMemo(
    () => ({
      user,
      tokens,
      isAuthenticated: !!tokens?.accessToken && canAccessLenderPortal(user?.role),
      isLoading,
      pendingEmail,
      pendingSessionId,
      login,
      triggerOtp,
      verifyOtp: verifyOtpHandler,
      logout
    }),
    [isLoading, login, logout, pendingEmail, pendingSessionId, tokens, user, verifyOtpHandler]
  );

  return <LenderAuthContext.Provider value={value}>{children}</LenderAuthContext.Provider>;
};

export default LenderAuthContext;
