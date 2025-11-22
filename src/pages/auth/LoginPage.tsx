import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useLocation, useNavigate } from "react-router-dom";

import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { login } from "../../core/endpoints/auth.api";
import { useAuthStore } from "../../core/auth.store";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = useMemo(() => (location.state as { from?: string })?.from ?? "/", [location.state]);

  const { accessToken, setTokens } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (accessToken) {
      navigate(from, { replace: true });
    }
  }, [accessToken, from, navigate]);

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async () => (await login<{ role?: string | null }>({ email, password })).data,
    onSuccess: (data) => {
      setTokens({ accessToken: data.token, role: data.user?.role ?? null });
      navigate(from, { replace: true });
    },
  });

  const errorMessage = useMemo(() => {
    if (!error) return null;

    const axiosError = error as AxiosError<{ error?: string }>;
    return axiosError.response?.data?.error || axiosError.message || "Unable to sign in";
  }, [error]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutate();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="space-y-1">
          <Badge>Staff Portal</Badge>
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="text-slate-600">Enter your credentials to reach the staff workspace.</p>
        </div>

        {isError ? (
          <Alert variant="destructive">
            <AlertTitle>Sign-in failed</AlertTitle>
            <AlertDescription>{errorMessage ?? "Check your credentials and try again."}</AlertDescription>
          </Alert>
        ) : (
          <Alert variant="info">
            <AlertTitle>Staff server login</AlertTitle>
            <AlertDescription>Use your staff account email and password.</AlertDescription>
          </Alert>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Signing in..." : "Continue"}
          </Button>
        </form>
      </div>
    </main>
  );
}
