import { useRef, useState } from "react";
import { useAuth } from "@/auth/AuthContext";

export default function LoginPage() {
  const auth = useAuth();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  const handleSendCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const ok = await auth.startOtp(phone);
      if (!ok) {
        setError(auth.error ?? "Failed to send code");
      }
    } catch (e) {
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
    setLoading(true);
    setError(null);
    try {
      const ok = await auth.verifyOtp(code);
      if (!ok) {
        setError(auth.error ?? "Invalid OTP");
      }
    } catch (e) {
      setError("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const showOtpInput = Boolean(auth.pendingPhoneNumber);

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Staff Login</h1>

      {(error || auth.error) && (
        <div role="alert" className="text-sm text-red-700">
          {error ?? auth.error}
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
            <input
              type="text"
              placeholder="Enter OTP"
              ref={otpInputRef}
              className="border rounded px-3 py-2 w-full"
            />
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
