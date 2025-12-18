import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login, isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const heading = useMemo(
    () => (user?.requiresOtp ? "Two-Factor Authentication" : "Staff Portal Login"),
    [user?.requiresOtp]
  );

  useEffect(() => {
    if (user?.requiresOtp) {
      navigate("/otp", { replace: true });
      return;
    }

    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate, user?.requiresOtp]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (loginError) {
      console.error(loginError);
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form
        className="w-full max-w-md bg-white shadow-md rounded-lg p-8 space-y-6"
        onSubmit={submit}
      >
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">{heading}</h1>
          <p className="text-sm text-slate-600">Sign in to manage the staff portal.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="Password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <button
          className="w-full rounded-md bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
