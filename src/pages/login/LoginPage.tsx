import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/services/api";
import { checkStaffServerHealth } from "@/utils/api";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiWarning, setApiWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkStaffServerHealth().then((healthy) => {
      if (!healthy) {
        setApiWarning("API unreachable. Please try again later.");
      }
    });
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const { accessToken } = await login(email, password);
      if (!accessToken) {
        throw new Error("Missing access token");
      }

      localStorage.setItem("accessToken", accessToken);
      try {
        await apiFetch("/api/auth/me");
      } catch {
        // Ignore profile fetch errors on login so navigation is not blocked
      }

      navigate("/", { replace: true });
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Staff Login</h1>

      {apiWarning && (
        <div role="alert" className="text-sm text-amber-700">
          {apiWarning}
        </div>
      )}

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
