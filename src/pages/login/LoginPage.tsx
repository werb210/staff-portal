import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate, type Location } from "react-router-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import type { ApiError } from "@/api/client";
import { API_BASE_URL, ENV } from "@/utils/env";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [healthStatus, setHealthStatus] = useState("Checking...");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      const redirectTo = (location.state as { from?: Location })?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      // eslint-disable-next-line no-console
      console.error("Login failed", apiError?.status, apiError?.details ?? apiError);
      setError("Unable to sign in. Please verify your credentials and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (ENV === "development") return;

    let isMounted = true;
    const healthUrl = `${API_BASE_URL.replace(/\/+$/, "")}/public/health`;

    const checkHealth = async () => {
      try {
        const response = await fetch(healthUrl);
        if (!isMounted) return;
        setHealthStatus(response.ok ? "Reachable" : `Error (${response.status})`);
      } catch (healthError) {
        if (!isMounted) return;
        // eslint-disable-next-line no-console
        console.error("Health check failed", healthError);
        setHealthStatus("API unreachable");
      }
    };

    checkHealth();

    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL, ENV]);

  return (
    <div className="auth-page">
      <Card title="Staff Portal Login">
        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <div className="auth-form__error">{error}</div>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </Button>
          {ENV !== "development" && (
            <p
              className="auth-form__debug"
              style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: "#6b7280" }}
            >
              API: {API_BASE_URL} — Health: {healthStatus}
              {healthStatus === "API unreachable" && " (login still available)"}
            </p>
          )}
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
