import { useState } from "react";
import { useAuthStore } from "../state/authStore";

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleLogin = async () => {
    setErr("");

    const success = await login(email, password);

    if (success) {
      window.location.href = "/";
    } else {
      setErr("Invalid credentials");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", textAlign: "center" }}>
      <h2>Staff Login</h2>

      <input
        style={{ width: "100%", marginTop: 20 }}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        style={{ width: "100%", marginTop: 10 }}
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {err && (
        <div style={{ color: "red", marginTop: 10 }}>
          {err}
        </div>
      )}

      <button
        style={{ marginTop: 20, width: "100%" }}
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Authenticating..." : "Login"}
      </button>
    </div>
  );
}
