import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { backend } from "../../lib/api";
import { saveToken } from "../../lib/auth";

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const data = await backend.login({ email, password });

      if (!data?.token) {
        setError("Invalid server response: missing token.");
        return;
      }

      saveToken(data.token);
      nav("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <h1 className="text-2xl font-bold text-center">Sign in</h1>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          className="w-full border rounded px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-black text-white py-2 rounded hover:bg-gray-900"
      >
        Continue
      </button>
    </form>
  );
}
