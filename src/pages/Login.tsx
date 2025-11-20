import { useState, type FormEvent } from "react";
import { useAuth } from "../lib/auth/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr("");

    try {
      await login(email, password);
      window.location.href = "/";
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        className="w-full max-w-sm space-y-4 bg-white shadow p-6 rounded-xl"
        onSubmit={submit}
      >
        <h1 className="text-xl font-bold mb-2 text-center">Staff Login</h1>

        {err && (
          <div className="text-red-500 text-sm text-center">{err}</div>
        )}

        <input
          type="email"
          className="border w-full p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="border w-full p-2 rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}
