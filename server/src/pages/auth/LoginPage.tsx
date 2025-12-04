import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/state/authStore";

export default function LoginPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await login(email, password);
    if (!ok) return setError("Invalid login");
    navigate("/");
  }

  return (
    <div className="login-wrapper">
      <form className="login-form" onSubmit={submit}>
        <h1>Boreal Staff Portal</h1>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" />
        {error && <div className="error">{error}</div>}
        <button>Login</button>
      </form>
    </div>
  );
}
