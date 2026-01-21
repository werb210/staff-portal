import { useState } from "react";
import { startOtp, verifyOtp } from "@/api/auth";
import { authStore } from "@/store/auth";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async () => {
    setLoading(true);
    setError(null);
    try {
      await startOtp({ phone });
      setOtpSent(true);
    } catch (e) {
      setError("Failed to send code");
    } finally {
      setLoading(false);
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

      <div className="space-y-4">
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

        {otpSent && (
          <div>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  const res = await verifyOtp(phone, otp);
                  authStore.setTokens(res.accessToken, res.refreshToken);
                  window.location.href = "/";
                } catch (e) {
                  setError("Invalid OTP");
                } finally {
                  setLoading(false);
                }
              }}
            >
              Verify code
            </button>
          </div>
        )}

        <button
          type="button"
          className="w-full bg-blue-600 text-white rounded px-4 py-2"
          onClick={handleSendCode}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send code"}
        </button>
      </div>
    </div>
  );
}
