import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { startOtp, verifyOtp, pendingPhoneNumber } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(pendingPhoneNumber ?? "");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">(pendingPhoneNumber ? "otp" : "phone");
  const [error, setError] = useState<string | null>(null);
  const canSubmitPhone = useMemo(() => phoneNumber.trim().length > 0, [phoneNumber]);
  const canSubmitCode = useMemo(() => code.trim().length === 6, [code]);

  const handleStart = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await startOtp(phoneNumber);
      setStep("otp");
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const code = (err as { code?: string })?.code;
      if (status === 409) {
        setError("OTP request conflict detected. Please try again.");
        return;
      }
      if (status && status >= 500) {
        setError("Server unavailable. Please try again shortly.");
        return;
      }
      if (status === 400 && code === "invalid_phone") {
        setError("Please enter a valid phone number.");
        return;
      }
      setError(err instanceof ApiError ? err.message : "Unable to start verification");
    }
  };

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await verifyOtp(code, phoneNumber);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const code = (err as { code?: string })?.code;
      if (status === 401 || code === "invalid_otp") {
        setError("Invalid verification code.");
        return;
      }
      if (status && status >= 500) {
        setError("Server unavailable. Please try again shortly.");
        return;
      }
      setError(err instanceof ApiError ? err.message : "Verification failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Staff Login</h1>

      {error && (
        <div role="alert" className="text-sm text-red-700">
          {error}
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
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="border rounded px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded px-4 py-2"
            disabled={!canSubmitPhone}
          >
            Send code
          </button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleVerify}>
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
              onChange={(e) => setCode(e.target.value)}
              className="border rounded px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded px-4 py-2"
            disabled={!canSubmitCode}
          >
            Verify code
          </button>
        </form>
      )}
    </div>
  );
}
