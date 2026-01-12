import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { startOtp, verifyOtp } = useAuth();
  const [rawPhone, setRawPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedPhoneNumber, setSubmittedPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isVerifying, setIsVerifying] = useState(false);

  const normalizePhone = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    const digits = trimmed.replace(/\D/g, "");
    if (!digits) return "";
    return `+${digits}`;
  };

  const normalizedPhone = useMemo(() => normalizePhone(rawPhone), [rawPhone]);
  const isPhoneValid = useMemo(
    () => Boolean(normalizedPhone && /^\+\d{10,15}$/.test(normalizedPhone)),
    [normalizedPhone]
  );
  const phoneError = useMemo(() => {
    if (step !== "phone") return null;
    if (!rawPhone.trim()) return null;
    return isPhoneValid ? null : "Invalid phone";
  }, [isPhoneValid, rawPhone, step]);

  const canSubmitCode = useMemo(() => code.trim().length === 6, [code]);

  const handleStart = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!normalizedPhone || !isPhoneValid) {
      setErrorMessage("Enter a valid phone number.");
      return;
    }

    try {
      setIsSubmitting(true);
      await startOtp({ phone: normalizedPhone });
      setSubmittedPhoneNumber(normalizedPhone);
      setStep("otp");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        console.error("OTP start failed.", {
          status: err.status,
          code: err.code,
          requestId: err.requestId,
          message: err.message,
          details: err.details,
          requestHeaders: err.requestHeaders
        });
        if (err.code?.toLowerCase().includes("expired") || err.status === 410) {
          setErrorMessage("Verification expired");
        } else {
          setErrorMessage(err.message);
        }
        return;
      }
      console.error("OTP start failed.", err);
      setErrorMessage(err instanceof Error ? err.message : "OTP failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    try {
      setIsVerifying(true);
      const phoneForVerification = submittedPhoneNumber;
      if (!phoneForVerification) {
        setErrorMessage("Missing phone number. Please start again.");
        return;
      }
      await verifyOtp({ code, phone: phoneForVerification });
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        console.error("OTP verification failed.", {
          status: err.status,
          code: err.code,
          requestId: err.requestId,
          message: err.message,
          details: err.details,
          requestHeaders: err.requestHeaders
        });
        if (err.code?.toLowerCase().includes("expired") || err.status === 410) {
          setErrorMessage("Verification expired");
        } else {
          setErrorMessage(err.message);
        }
        return;
      }
      console.error("OTP verification failed.", err);
      setErrorMessage(err instanceof Error ? err.message : "OTP failed");
    } finally {
      setIsVerifying(false);
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

      {step === "phone" ? (
        <form className="space-y-4" onSubmit={handleStart}>
          <div className="flex flex-col space-y-1">
            <label htmlFor="phoneNumber">Phone number</label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              inputMode="tel"
              value={rawPhone}
              onChange={(event) => {
                setRawPhone(event.target.value);
                setErrorMessage(null);
              }}
              aria-invalid={phoneError ? "true" : "false"}
              className="border rounded px-3 py-2"
              placeholder="+15555550100"
            />
            {phoneError && <span className="text-xs text-red-700">{phoneError}</span>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send code"}
          </button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleVerify}>
          <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Sending code to <span className="font-semibold">{submittedPhoneNumber}</span>
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="otp">Verification code</label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(event) => {
                setCode(event.target.value.replace(/\D/g, ""));
                setErrorMessage(null);
              }}
              className="border rounded px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60"
            disabled={!canSubmitCode || isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify code"}
          </button>
        </form>
      )}
    </div>
  );
}
