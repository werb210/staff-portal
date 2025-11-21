import { useState } from "react";
import api from "@/lib/http";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    const res = await api.post("/api/users/login", { email, password });
    const { token, user } = res.data;

    setAuth(token, user);
    window.location.href = "/";
  }

  return (
    <div className="p-6 max-w-sm mx-auto">
      <form onSubmit={handleLogin} className="space-y-4">
        <input className="input" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button className="btn btn-primary w-full">Login</button>
      </form>
    </div>
  );
}
