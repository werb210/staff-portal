import { useState } from "react";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await login(email, password);
      setUser(res?.user);
      window.location.href = "/";
    } catch (e: any) {
      setErr(e.message || "Login failed");
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={submit} className="bg-white p-8 rounded shadow-md w-80">
        <h1 className="text-xl font-semibold mb-4 text-center">Staff Login</h1>

        {err && <p className="text-red-600 text-sm mb-3">{err}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
