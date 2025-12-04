import { useState } from "react";
import { login } from "@/api/auth";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: any) {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (e: any) {
      setErr("Invalid credentials");
    }
  }

  return (
    <div style={{ maxWidth: 350, margin: "60px auto" }}>
      <h2>Login</h2>
      {err && <p style={{ color: "red" }}>{err}</p>}
      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br/><br/>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br/><br/>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
