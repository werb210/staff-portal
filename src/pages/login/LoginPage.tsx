import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { ApiError } from "@/api/http";
import { normalizeToE164 } from "@/utils/phone";
import { getRequestId } from "@/utils/requestId";

export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    endpoint?: string;
    requestId?: string;
  } | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const otpInputRef = useRef<HTMLInputElement | null>(null);

  // 🚨 CRITICAL: redirect immediately once authenticated
  useEffect(() => {
    if (auth.authStatus === "authenticated") {
      navigate("/", { replace: true });
    }
  }, [auth.authStatus, navigate]);

  const handleSendCode = async () => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setStatus(null);

    try {
      const normalizedPhone = normalizeToE164(phone);
      const ok = await auth.startOtp({ phone: normalizedPhone });
      if (!ok) {
        setError(auth.error ?? "Failed to send code");
        setStatus(null);
        return;
      }
      setStatus("Code sent. Check your phone for the verification code.");
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
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const code = otpInputRef.current?.value?.trim() ?? "";

    if (!code) {
      setError("Please enter the verification code.");
      return;
    }

    const targetPhone = auth.pendingPhoneNumber ?? phone;
    let normalizedPhone = targetPhone;

    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setStatus(null);

    try {
      normalizedPhone = normalizeToE164(targetPhone);
      const ok = await auth.verifyOtp({ phone: normalizedPhone, code });
      if (!ok) {
        setError(auth.error ?? "Invalid verification code");
        setStatus(null);
      }
    } catch (err) {
      if (err instanceof Error && err.message === "Invalid phone number") {
        setError("Please enter a valid phone number.");
        return;
      }
      if (err instanceof ApiError) {
        setError(err.message);
        setErrorDetails({ endpoint: "/auth/otp/verify", requestId: err.requestId ?? getRequestId() });
        return;
      }
      setError("Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const showOtpInput = Boolean(auth.pendingPhoneNumber);

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Staff Login</h1>

      {(error || auth.error) && (
        <div role="alert" className="text-sm text-red-700 space-y-1">
          <div>{error ?? auth.error}</div>
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

      <div className="space-y-4">
        {!showOtpInput && (
          <label className="block">
            Phone number
            <input
              type="tel"
              className="border rounded px-3 py-2 w-full"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+15555550100"
            />
          </label>
        )}

        {showOtpInput && (
          <div>
            <label className="block">
              Verification code
              <input
                type="text"
                ref={otpInputRef}
                placeholder="Enter OTP"
                className="border rounded px-3 py-2 w-full"
              />
            </label>

            <button
              type="button"
              className="mt-3 w-full bg-blue-600 text-white rounded px-4 py-2"
              onClick={handleVerifyCode}
              disabled={loading}
            >
              Verify code
            </button>
          </div>
        )}

        {!showOtpInput && (
          <button
            type="button"
            className="w-full bg-blue-600 text-white rounded px-4 py-2"
            onClick={handleSendCode}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send code"}
          </button>
        )}
      </div>
    </div>
  );
}
