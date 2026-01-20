import { FormEvent, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { ApiError } from "@/api/http";
import { useAuth } from "@/auth/AuthContext";
import { normalizeToE164 } from "@/utils/phone";

const parseOtpErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error) {
    const axiosError = error as AxiosError;
    const data = axiosError?.response?.data as any;
    if (typeof data?.message === "string") return data.message;
    if (typeof axiosError.message === "string") return axiosError.message;
  }
  return "OTP failed";
};

export default function LoginPage() {
  const { startOtp, verifyOtp, status, error: authError } = useAuth();

  const [rawPhone, setRawPhone] = useState("");
  const [submittedPhoneNumber, setSubmittedPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [hasRequestedCode, setHasRequestedCode] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { normalizedPhone, normalizationError } = useMemo(() => {
    if (!rawPhone.trim()) return { normalizedPhone: "", normalizationError: null };
    try {
      return { normalizedPhone: normalizeToE164(rawPhone), normalizationError: null };
    } catch {
      return { normalizedPhone: "", normalizationError: "Invalid phone number." };
    }
  }, [rawPhone]);

  const isSending = status === "sending";
  const isVerifying = status === "verifying";
  const showCodeStep = hasRequestedCode;
  const errorMessage = localError ?? authError;

  const handleStart = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!normalizedPhone || normalizationError) return;

    try {
      await startOtp({ phone: normalizedPhone });
      setSubmittedPhoneNumber(normalizedPhone);
      setHasRequestedCode(true);
    } catch (err) {
      setLocalError(parseOtpErrorMessage(err));
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const trimmed = code.trim();
    if (!trimmed) return;
    const phone = submittedPhoneNumber || normalizedPhone || rawPhone;
    console.log("VERIFY SUBMIT", { phone, code: trimmed });
    await verifyOtp(phone, trimmed);
  };

  const handleResend = async () => {
    setLocalError(null);
    const phone = submittedPhoneNumber || normalizedPhone;
    if (!phone) {
      setLocalError("Enter a valid phone number to resend the code.");
      return;
    }
    try {
      await startOtp({ phone });
      setSubmittedPhoneNumber(phone);
      setHasRequestedCode(true);
    } catch (err) {
      setLocalError(parseOtpErrorMessage(err));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Staff Login</h1>

      {errorMessage && (
        <div role="alert" className="text-sm text-red-700">
          {errorMessage}
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
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            className="border rounded px-3 py-2 w-full"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded px-4 py-2"
          >
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
