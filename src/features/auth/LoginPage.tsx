import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./LoginService";

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrMsg("");

    try {
      await login({ email, password });
      nav("/app/dashboard");
    } catch (err: any) {
      setErrMsg(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white shadow p-6 rounded"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Staff Login</h2>

        <label className="block mb-3">
          <span className="text-gray-700">Email</span>
          <input
            type="email"
            className="mt-1 w-full border rounded p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">Password</span>
          <input
            type="password"
            className="mt-1 w-full border rounded p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {errMsg && (
          <p className="text-red-600 text-sm mb-4 text-center">{errMsg}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
        >
          {loading ? "Signing in…" : "Login"}
        </button>
      </form>
    </div>
  );
}
