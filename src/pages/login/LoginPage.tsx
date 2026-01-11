import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { ApiError } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { startOtp, verifyOtp } = useAuth();
  const [rawPhone, setRawPhone] = useState("");
  const [phoneE164, setPhoneE164] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedPhoneNumber, setSubmittedPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isVerifying, setIsVerifying] = useState(false);

  const normalizePhone = (nextValue: string) => {
    setRawPhone(nextValue);
    const trimmed = nextValue.trim();
    if (!trimmed) {
      setPhoneE164("");
      setIsValid(false);
      setErrorMessage(null);
      return;
    }

    const parsed = trimmed.startsWith("+")
      ? parsePhoneNumberFromString(trimmed)
      : parsePhoneNumberFromString(trimmed, "CA");

    if (!parsed || !parsed.isValid()) {
      setPhoneE164("");
      setIsValid(false);
      setErrorMessage("Invalid phone number");
      return;
    }

    setPhoneE164(parsed.format("E.164"));
    setIsValid(true);
    setErrorMessage(null);
  };

  const canSubmitCode = useMemo(() => code.trim().length === 6, [code]);

  const handleStart = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!isValid || !phoneE164) {
      setErrorMessage("Invalid phone number");
      return;
    }

    try {
      setIsSubmitting(true);
      await startOtp({ phone: phoneE164 });
      setSubmittedPhoneNumber(phoneE164);
      setStep("otp");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const fallbackMap: Record<number, string> = {
          400: "Invalid phone number",
          401: "SMS service authentication failure",
          500: "Server error"
        };
        setErrorMessage(err.message || fallbackMap[err.status] || "Request failed");
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Unable to send code.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    try {
      setIsVerifying(true);
      const phoneForVerification = submittedPhoneNumber || phoneE164;
      if (!phoneForVerification) {
        setErrorMessage("Missing phone number. Please start again.");
        return;
      }
      await verifyOtp({ code, phone: phoneForVerification });
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const fallbackMap: Record<number, string> = {
          400: "Invalid phone number",
          401: "SMS service authentication failure",
          500: "Server error"
        };
        setErrorMessage(err.message || fallbackMap[err.status] || "Request failed");
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Unable to verify code.");
      }
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
                normalizePhone(event.target.value);
              }}
              className="border rounded px-3 py-2"
              placeholder="+1 587 888 1837"
            />
            {isValid ? (
              <p className="text-xs text-slate-500">Normalized: {phoneE164}</p>
            ) : null}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60"
            disabled={!isValid || isSubmitting}
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
