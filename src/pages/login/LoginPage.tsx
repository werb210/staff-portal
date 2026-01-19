import { FormEvent, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { normalizeToE164 } from "@/utils/phone";

export default function LoginPage() {
  const { startOtp, verifyOtp, setAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [rawPhone, setRawPhone] = useState("");
  const [submittedPhone, setSubmittedPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastVerify = useRef<number>(0);

  const normalizedPhone = useMemo(() => {
    try {
      return rawPhone ? normalizeToE164(rawPhone) : "";
    } catch {
      return "";
    }
  }, [rawPhone]);

  async function handleStart(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!normalizedPhone) {
      setError("Enter a valid phone number");
      return;
    }

    try {
      setLoading(true);
      await startOtp({ phone: normalizedPhone });
      setSubmittedPhone(normalizedPhone);
      setStep("otp");
    } catch {
      setError("Failed to send verification code");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (code.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }

    const now = Date.now();
    if (now - lastVerify.current < 3000) {
      setError("Please wait before retrying");
      return;
    }
    lastVerify.current = now;

    try {
      setLoading(true);
      await verifyOtp({ phone: submittedPhone, code });
      setAuthenticated();
      navigate("/");
    } catch {
      setError("Invalid or expired code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Staff Login</h1>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {step === "phone" ? (
        <form onSubmit={handleStart} className="space-y-4">
          <input
            type="tel"
            placeholder="+15555550100"
            value={rawPhone}
            onChange={(e) => setRawPhone(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {loading ? "Sending…" : "Submit code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="text-sm text-gray-600">
            Code sent to {submittedPhone}
          </div>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="w-full border px-3 py-2 rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {loading ? "Verifying…" : "Verify code"}
          </button>
        </form>
      )}
    </div>
  );
}
