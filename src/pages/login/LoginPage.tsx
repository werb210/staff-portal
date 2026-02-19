import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserAuthError, PublicClientApplication } from "@azure/msal-browser";
import { useAuth } from "@/auth/AuthContext";
import { ApiError } from "@/api/http";
import apiClient from "@/api/httpClient";
import ErrorBanner from "@/components/ui/ErrorBanner";
import OtpInput from "@/components/OtpInput";
import { microsoftAuthConfig } from "@/config/microsoftAuth";
import { getErrorMessage } from "@/utils/errors";
import { normalizeToE164 } from "@/utils/phone";
import { getRequestId } from "@/utils/requestId";
import { logger } from "@/utils/logger";

type MicrosoftLoginResponse = {
  accessToken?: string;
  refreshToken?: string;
};

export const resolvePostLoginDestination = (role?: string | null) =>
  role === "Referrer"
    ? "/referrer"
    : role === "Lender"
      ? "/lenders"
      : role === "Admin"
        ? "/admin/ai"
        : role === "Staff"
          ? "/dashboard"
          : "/unauthorized";

export default function LoginPage() {

  const auth = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    endpoint?: string;
    requestId?: string;
  } | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [microsoftError, setMicrosoftError] = useState<string | null>(null);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
  const [hideMicrosoftButton, setHideMicrosoftButton] = useState(false);
  const isSendingRef = useRef(false);
  const isVerifyingRef = useRef(false);
  const hasNavigatedRef = useRef(false);
  const redirectHandledRef = useRef(false);

  const msalClient = useMemo(() => {
    if (!microsoftAuthConfig?.clientId) return null;
    const isIos = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
    return new PublicClientApplication({
      auth: {
        clientId: microsoftAuthConfig.clientId,
        authority: microsoftAuthConfig.authority,
        redirectUri: microsoftAuthConfig.redirectUri
      },
      cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: isIos
      }
    });
  }, []);

  const isMicrosoftConfigured = Boolean(microsoftAuthConfig?.clientId);

  const exchangeMicrosoftToken = useCallback(
    async (accessToken: string, accountEmail?: string | null) => {
      const payload = {
        accessToken,
        accountEmail: accountEmail ?? undefined
      };
      return apiClient.post<MicrosoftLoginResponse>("/auth/microsoft", payload, { skipAuth: true });
    },
    []
  );

  // 🚨 CRITICAL: redirect immediately once authenticated
  useEffect(() => {
    if (auth.authStatus === "authenticated" && !hasNavigatedRef.current) {
      const destination = resolvePostLoginDestination(auth.user?.role);
      hasNavigatedRef.current = true;
      navigate(destination, { replace: true });
    }
  }, [auth.authStatus, auth.user?.role, navigate]);

  useEffect(() => {
    if (!msalClient) return;
    let isMounted = true;
    const handleRedirect = async () => {
      if (redirectHandledRef.current) return;
      redirectHandledRef.current = true;
      try {
        const response = await msalClient.handleRedirectPromise();
        if (!response) return;
        if (!isMounted) return;
        setIsMicrosoftLoading(true);
        const tokenResponse = response.accessToken
          ? response
          : await msalClient.acquireTokenSilent({
              scopes: microsoftAuthConfig.scopes,
              account: response.account ?? undefined
            });
        const authResponse = await exchangeMicrosoftToken(
          tokenResponse.accessToken,
          response.account?.username
        );
        if (!authResponse?.accessToken) {
          setMicrosoftError("Microsoft sign-in failed. Please try again.");
          return;
        }
        await auth.login(authResponse.accessToken);
      } catch (error) {
        if (!isMounted) return;
        setMicrosoftError(getErrorMessage(error as Error, "Microsoft sign-in failed."));
      } finally {
        if (isMounted) {
          setIsMicrosoftLoading(false);
        }
      }
    };
    void handleRedirect();
    return () => {
      isMounted = false;
    };
  }, [auth, exchangeMicrosoftToken, msalClient]);

  const handleSendCode = async () => {
    if (isSendingRef.current) return;
    isSendingRef.current = true;
    setIsSending(true);
    setError(null);
    setOtpError(null);
    setErrorDetails(null);
    setStatus(null);
    setMicrosoftError(null);

    try {
      const normalizedPhone = normalizeToE164(phone);
      const ok = await auth.startOtp({ phone: normalizedPhone });
      if (!ok) {
        setError(auth.error ?? "Failed to send code");
        setStatus(null);
        setOtpSent(false);
        return;
      }
      setStatus("Code sent. Check your phone for the verification code.");
      setOtpSent(true);
      setOtpValue("");
    } catch (err) {
      if (err instanceof Error && err.message === "Invalid phone number") {
        setError("Please enter a valid phone number.");
        return;
      }
      if (err instanceof ApiError) {
        setError(err.message);
        setErrorDetails({ endpoint: "/auth/otp/start", requestId: err.requestId ?? getRequestId() });
        logger.error("OTP start failed.", { requestId: err.requestId ?? getRequestId(), error: err });
        return;
      }
      if (typeof err === "object" && err && "isAxiosError" in err && (err as { code?: string }).code) {
        setError("Network error. Please try again.");
        setErrorDetails({ endpoint: "/auth/otp/start", requestId: getRequestId() });
        return;
      }
      setError("Failed to send code");
    } finally {
      setIsSending(false);
      isSendingRef.current = false;
    }
  };

  const handleMicrosoftLogin = async () => {
    if (!msalClient || !isMicrosoftConfigured || isMicrosoftLoading) return;
    setMicrosoftError(null);
    setIsMicrosoftLoading(true);
    const preferRedirect =
      typeof window !== "undefined" &&
      (window.matchMedia?.("(display-mode: standalone)").matches ||
        (navigator as { standalone?: boolean }).standalone ||
        /iphone|ipad|ipod/i.test(navigator.userAgent));

    try {
      if (preferRedirect) {
        await msalClient.loginRedirect({ scopes: microsoftAuthConfig.scopes });
        return;
      }
      const response = await msalClient.loginPopup({ scopes: microsoftAuthConfig.scopes });
      const tokenResponse = response.accessToken
        ? response
        : await msalClient.acquireTokenSilent({
            scopes: microsoftAuthConfig.scopes,
            account: response.account ?? undefined
          });
      const authResponse = await exchangeMicrosoftToken(
        tokenResponse.accessToken,
        response.account?.username
      );
      if (!authResponse?.accessToken) {
        setMicrosoftError("Microsoft sign-in failed. Please contact support.");
        return;
      }
      await auth.login(authResponse.accessToken);
    } catch (error) {
      const authError = error as Error;
      const isSilentFailure =
        error instanceof BrowserAuthError &&
        ["popup_window_error", "empty_window_error", "monitor_window_timeout"].includes(error.errorCode);
      if (isSilentFailure) {
        setHideMicrosoftButton(true);
        if (preferRedirect) {
          try {
            await msalClient.loginRedirect({ scopes: microsoftAuthConfig.scopes });
            return;
          } catch (redirectError) {
            setMicrosoftError(getErrorMessage(redirectError as Error, "Microsoft sign-in failed."));
          }
        }
      }
      setMicrosoftError(getErrorMessage(authError, "Microsoft sign-in failed."));
    } finally {
      setIsMicrosoftLoading(false);
    }
  };

  const handleVerifyCode = async (code: string) => {
    if (isVerifyingRef.current) return;
    if (!code || code.length < 6) {
      setOtpError("Please enter the 6-digit verification code.");
      return;
    }

    const targetPhone = auth.pendingPhoneNumber ?? phone;
    let normalizedPhone = targetPhone;

    isVerifyingRef.current = true;
    setIsVerifying(true);
    setError(null);
    setOtpError(null);
    setErrorDetails(null);
    setStatus(null);
    setMicrosoftError(null);

    const normalizeOtpError = (message?: string | null) => {
      const normalized = message?.toLowerCase() ?? "";
      if (normalized.includes("expired")) {
        return "Verification code expired. Request a new one.";
      }
      return "Invalid verification code";
    };

    try {
      normalizedPhone = normalizeToE164(targetPhone);
      const ok = await auth.verifyOtp({ phone: normalizedPhone, code });
      if (!ok) {
        setOtpError(normalizeOtpError(auth.error));
        setStatus(null);
      }
    } catch (err) {
      if (err instanceof Error && err.message === "Invalid phone number") {
        setOtpError("Please enter a valid phone number.");
        return;
      }
      if (err instanceof ApiError) {
        setOtpError(normalizeOtpError(err.message));
        setErrorDetails({ endpoint: "/auth/otp/verify", requestId: err.requestId ?? getRequestId() });
        return;
      }
      setOtpError("Invalid verification code");
    } finally {
      setIsVerifying(false);
      isVerifyingRef.current = false;
    }
  };

  const showOtpInput = Boolean(auth.pendingPhoneNumber) || otpSent;
  const inputsDisabled = isSending || isVerifying || isMicrosoftLoading;

  return (
    <div className="login-shell" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}>
      <div className="login-card">
        <div className="login-header">
          <h1>Staff Login</h1>
          <p>Sign in with your phone number or Microsoft 365 account.</p>
        </div>

        {(error || auth.error || microsoftError) && (
          <div className="space-y-2">
            <ErrorBanner
              message={error ?? auth.error ?? microsoftError ?? "Unable to sign in."}
            />
            {errorDetails && (
              <div className="text-xs text-red-600 space-y-0.5">
                <div>Request ID: {errorDetails.requestId ?? ""}</div>
                <div>Endpoint: {errorDetails.endpoint}</div>
              </div>
            )}
          </div>
        )}
        {status && (
          <div role="status" className="text-sm text-emerald-700">
            {status}
          </div>
        )}

        <div className="login-body">
          {!showOtpInput && (
            <label className="block">
              Phone number
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                className="login-input"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError(null);
                  setErrorDetails(null);
                  setMicrosoftError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleSendCode();
                  }
                }}
                placeholder="+15555550100"
                disabled={inputsDisabled}
              />
            </label>
          )}

          {showOtpInput && (
            <div className="login-otp">
              <label className="block">Verification code</label>
              <OtpInput
                value={otpValue}
                length={6}
                disabled={isVerifying || isMicrosoftLoading}
                onChange={(nextValue) => {
                  setOtpValue(nextValue);
                  setOtpError(null);
                  setError(null);
                  setErrorDetails(null);
                  setMicrosoftError(null);
                }}
                onComplete={(nextValue) => handleVerifyCode(nextValue)}
              />
              {otpError && <ErrorBanner message={otpError} />}
              {otpError && errorDetails && (
                <div className="text-xs text-red-600 space-y-0.5">
                  <div>Request ID: {errorDetails.requestId ?? ""}</div>
                  <div>Endpoint: {errorDetails.endpoint}</div>
                </div>
              )}
              <button
                type="button"
                className="login-link"
                onClick={handleSendCode}
                disabled={inputsDisabled}
              >
                {isSending ? "Sending new code..." : "Resend code"}
              </button>
            </div>
          )}

          {!showOtpInput && (
            <button
              type="button"
              className="login-primary"
              onClick={handleSendCode}
              disabled={inputsDisabled}
            >
              {isSending ? "Sending..." : "Send code"}
            </button>
          )}
          {isVerifying && showOtpInput && <p className="text-xs text-slate-500">Verifying code…</p>}

          {!showOtpInput && (
            <div className="login-divider" role="presentation">
              <span>or</span>
            </div>
          )}

          {!showOtpInput && (
            <>
              <button
                type="button"
                className="login-secondary"
                onClick={handleMicrosoftLogin}
                disabled={!isMicrosoftConfigured || isMicrosoftLoading || hideMicrosoftButton}
              >
                {isMicrosoftLoading ? "Connecting to Microsoft 365..." : "Continue with Microsoft 365"}
              </button>
              {!isMicrosoftConfigured && (
                <p className="text-xs text-slate-500">Microsoft sign-in is not configured.</p>
              )}
              {hideMicrosoftButton && (
                <p className="text-xs text-amber-600">
                  Microsoft sign-in requires a new window. Use OTP if pop-ups are blocked.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
