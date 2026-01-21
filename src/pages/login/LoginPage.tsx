import { FormEvent, useMemo, useState } from "react";
import { isAxiosError, type AxiosError } from "axios";
import { Navigate } from "react-router-dom";
import { ApiError } from "@/api/http";
import { useAuth } from "@/hooks/useAuth";
import { normalizeToE164 } from "@/utils/phone";
import { getRequestId } from "@/utils/requestId";

type OtpErrorDetails = {
  message: string;
  requestId: string;
  endpoint: string;
};

type ApiErrorPayload = {
  message?: string;
  code?: string;
};

const CORS_BLOCKED_MESSAGE = "Network error. Please try again.";
const OTP_ERROR_MESSAGES: Record<string, string> = {
  invalid_otp: "Invalid verification code. Please try again.",
  otp_invalid: "Invalid verification code. Please try again.",
  expired_otp: "Verification code expired. Request a new code.",
  otp_expired: "Verification code expired. Request a new code."
};

const resolveApiErrorMessage = (error: ApiError): string => {
  const details = error.details as ApiErrorPayload | undefined;
  const code = error.code ?? details?.code;
  if (code && OTP_ERROR_MESSAGES[code]) {
    return OTP_ERROR_MESSAGES[code];
  }
  if (typeof details?.message === "string" && details.message.trim()) {
    return details.message;
  }
  return error.message;
};

const buildOtpErrorDetails = (error: unknown, endpoint: string): OtpErrorDetails => {
  const fallbackRequestId = getRequestId();
  let message = "OTP failed";
  let requestId = fallbackRequestId;

  if (error instanceof ApiError) {
    message = resolveApiErrorMessage(error);
    requestId = error.requestId ?? fallbackRequestId;
  } else if (typeof error === "string") {
    message = error;
  } else if (typeof error === "object" && error) {
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.code === "ERR_NETWORK" || !axiosError.response) {
        message = CORS_BLOCKED_MESSAGE;
      } else {
        const data = axiosError.response?.data as ApiErrorPayload | undefined;
        if (typeof data?.message === "string") {
          message = data.message;
        } else if (typeof axiosError.message === "string") {
          message = axiosError.message;
        }
      }
    } else if ("message" in error && typeof (error as { message?: string }).message === "string") {
      message = (error as { message?: string }).message ?? message;
    }
  }

  return { message, requestId, endpoint };
};

export default function LoginPage() {
  const { startOtp, verifyOtp, authStatus, error: authError } = useAuth();

  const [rawPhone, setRawPhone] = useState("");
  const [submittedPhoneNumber, setSubmittedPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [hasRequestedCode, setHasRequestedCode] = useState(false);
  const [localError, setLocalError] = useState<OtpErrorDetails | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const { normalizedPhone, normalizationError } = useMemo(() => {
    if (!rawPhone.trim()) return { normalizedPhone: "", normalizationError: null };
    try {
      return { normalizedPhone: normalizeToE164(rawPhone), normalizationError: null };
    } catch {
      return { normalizedPhone: "", normalizationError: "Invalid phone number." };
    }
  }, [rawPhone]);

  const showCodeStep = hasRequestedCode;
  const errorMessage = localError?.message ?? authError;

  if (authStatus === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleStart = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!normalizedPhone || normalizationError) return;

    setIsSending(true);
    try {
      await startOtp({ phone: normalizedPhone });
      setSubmittedPhoneNumber(normalizedPhone);
      setHasRequestedCode(true);
      setCode("");
    } catch (err) {
      const details = buildOtpErrorDetails(err, "/auth/otp/start");
      console.error("OTP start failed.", { ...details, error: err });
      setLocalError(details);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const trimmed = code.trim();
    const phone = submittedPhoneNumber || normalizedPhone || rawPhone;
    setIsVerifying(true);
    try {
      await verifyOtp({ phone, code: trimmed });
    } catch (err) {
      const details = buildOtpErrorDetails(err, "/auth/otp/verify");
      console.error("OTP verify failed.", { ...details, error: err });
      setLocalError(details);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setLocalError(null);
    const phone = submittedPhoneNumber || normalizedPhone;
    if (!phone) {
      setLocalError({
        message: "Enter a valid phone number to resend the code.",
        requestId: getRequestId(),
        endpoint: "/auth/otp/start"
      });
      return;
    }
    setIsSending(true);
    try {
      await startOtp({ phone });
      setSubmittedPhoneNumber(phone);
      setHasRequestedCode(true);
      setCode("");
    } catch (err) {
      const details = buildOtpErrorDetails(err, "/auth/otp/start");
      console.error("OTP resend failed.", { ...details, error: err });
      setLocalError(details);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Staff Login</h1>

      {errorMessage && (
        <div role="alert" className="text-sm text-red-700">
          {errorMessage}
          {localError?.requestId && (
            <div className="mt-1 text-xs text-red-700">Request ID: {localError.requestId}</div>
          )}
          {localError?.endpoint && (
            <div className="text-xs text-red-700">Endpoint: {localError.endpoint}</div>
          )}
        </div>
      )}

      {!showCodeStep ? (
        <form onSubmit={handleStart} className="space-y-4">
          <label className="block">
            Phone number
            <input
              type="tel"
              className="border rounded px-3 py-2 w-full"
              value={rawPhone}
              onChange={(e) => setRawPhone(e.target.value)}
              placeholder="+15555550100"
            />
          </label>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded px-4 py-2"
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="text-sm">
            Verification code sent to <b>{submittedPhoneNumber}</b>
          </div>
          <label className="block">
            Verification code
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="border rounded px-3 py-2 w-full"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
          </label>
          <button type="submit" className="w-full bg-blue-600 text-white rounded px-4 py-2">
            {isVerifying ? "Verifying..." : "Verify code"}
          </button>
          <button
            type="button"
            className="w-full border border-blue-600 text-blue-600 rounded px-4 py-2"
            onClick={handleResend}
            disabled={isSending}
          >
            {isSending ? "Resending..." : "Resend code"}
          </button>
        </form>
      )}
    </div>
  );
}
