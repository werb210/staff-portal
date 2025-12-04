// server/src/pages/auth/LoginPage.tsx
import { FormEvent, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLogin } from "@/hooks/useLogin";
import { useAuthStore } from "@/state/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutateAsync, isPending, error } = useLogin();
  const loading = useAuthStore((s) => s.loading);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await mutateAsync({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      // error is surfaced below
    }
  }

  const disabled = isPending || loading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Staff Portal Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {(error as any)?.message || "Login failed"}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2 rounded bg-slate-900 text-white text-sm font-medium disabled:opacity-60"
            disabled={disabled}
          >
            {disabled ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
