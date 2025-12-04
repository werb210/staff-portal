// server/src/pages/auth/Login.tsx

import { useState } from "react";
import { login } from "../../api/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: any) {
    e.preventDefault();
    setErr("");

    try {
      await login(email, password);
      window.location.href = "/";
    } catch (e: any) {
      setErr(e.message || "Login failed");
    }
  }

  return (
    <div className="login-container">
      <form onSubmit={submit}>
        <h2>Staff Login</h2>

        {err && <div className="error">{err}</div>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
