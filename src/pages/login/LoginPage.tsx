import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const errorCodeMap: Record<string, string> = {
    invalid_credentials: "invalid_credentials",
    missing_idempotency_key: "missing_idempotency_key",
    account_locked: "account_locked",
    password_expired: "password_expired"
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const code = (err as { code?: string })?.code;
      if (err instanceof ApiError && (status === 400 || status === 401)) {
        console.info("Login failed request headers.", {
          idempotencyKey: err.requestHeaders?.["Idempotency-Key"] ?? err.requestHeaders?.["idempotency-key"],
          authorization: err.requestHeaders?.Authorization ?? err.requestHeaders?.authorization
        });
      }
      if (code && errorCodeMap[code]) {
        setError(errorCodeMap[code]);
        return;
      }
      if (status === 401) {
        setError("invalid_credentials");
        return;
      }
      if (status === 409) {
        setError("Login conflict detected. Please try again.");
        return;
      }
      if (status && status >= 500) {
        setError("Server unavailable. Please try again shortly.");
        return;
      }
      if (status === 400 && code === "missing_idempotency_key") {
        setError("missing_idempotency_key");
        return;
      }
      setError(err instanceof ApiError ? err.message : "Authentication failed");
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

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col space-y-1">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded px-4 py-2"
        >
          Login
        </button>
      </form>
    </div>
  );
}
