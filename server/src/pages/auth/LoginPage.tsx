import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/state/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const [email, setEmail] = useState("todd.w@boreal.financial");
  const [password, setPassword] = useState("1Sucker1!");
  const [error, setError] = useState<string | null>(null);

  const from = location.state?.from?.pathname ?? "/";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || "Login failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a"
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          background: "#111827",
          padding: 32,
          borderRadius: 12,
          width: 360,
          color: "white",
          boxShadow: "0 15px 40px rgba(0,0,0,0.4)"
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 16 }}>Boreal Staff Login</h1>

        <label style={{ display: "block", marginBottom: 8 }}>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Email</div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #374151",
              background: "#020617",
              color: "white"
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 12 }}>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Password</div>
          <input
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #374151",
              background: "#020617",
              color: "white"
            }}
          />
        </label>

        {error && (
          <div
            style={{
              background: "#7f1d1d",
              color: "#fecaca",
              padding: "6px 8px",
              borderRadius: 6,
              marginBottom: 8,
              fontSize: 12
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 6,
            border: "none",
            background: loading ? "#4b5563" : "#3b82f6",
            color: "white",
            fontWeight: 600,
            cursor: loading ? "default" : "pointer"
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
