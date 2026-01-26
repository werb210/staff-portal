import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { ApiError } from "@/api/http";
import ErrorBanner from "@/components/ui/ErrorBanner";
import OtpInput from "@/components/OtpInput";
import { normalizeToE164 } from "@/utils/phone";
import { getRequestId } from "@/utils/requestId";

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
  const isSendingRef = useRef(false);
  const isVerifyingRef = useRef(false);

  // 🚨 CRITICAL: redirect immediately once authenticated
  useEffect(() => {
    if (auth.authStatus === "authenticated") {
      navigate("/dashboard", { replace: true });
    }
  }, [auth.authStatus, navigate]);

  const handleSendCode = async () => {
    if (isSendingRef.current) return;
    isSendingRef.current = true;
    setIsSending(true);
    setError(null);
    setOtpError(null);
    setErrorDetails(null);
    setStatus(null);

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
        console.error("OTP start failed.", { requestId: err.requestId ?? getRequestId(), error: err });
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

  return (
    <div className="login-shell" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}>
      <div className="login-card">
        <div className="login-header">
          <h1>Staff Portal</h1>
          <p>Sign in with your phone number to receive a secure one-time passcode.</p>
        </div>

        {(error || auth.error) && (
          <div className="space-y-2">
            <ErrorBanner message={error ?? auth.error ?? "Unable to sign in."} />
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
                }}
                placeholder="+15555550100"
                disabled={isSending}
              />
            </label>
          )}

          {showOtpInput && (
            <div className="login-otp">
              <label className="block">Verification code</label>
              <OtpInput
                value={otpValue}
                length={6}
                disabled={isVerifying}
                onChange={(nextValue) => {
                  setOtpValue(nextValue);
                  setOtpError(null);
                  setError(null);
                  setErrorDetails(null);
                }}
                onComplete={(nextValue) => handleVerifyCode(nextValue)}
              />
              {otpError && <ErrorBanner message={otpError} />}
              <button
                type="button"
                className="login-link"
                onClick={handleSendCode}
                disabled={isSending || isVerifying}
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
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Send code"}
            </button>
          )}
          {isVerifying && showOtpInput && <p className="text-xs text-slate-500">Verifying code…</p>}
        </div>
      </div>
    </div>
  );
}
