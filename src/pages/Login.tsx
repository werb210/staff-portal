import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: any) {
    e.preventDefault();
    setErr("");
    try {
      await login(email, password);
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={submit}
        className="bg-white shadow-lg rounded p-8 w-full max-w-md space-y-4"
      >
        <h1 className="text-xl font-semibold text-center">Staff Login</h1>

        {err && (
          <div className="bg-red-100 text-red-800 p-2 rounded text-sm">
            {err}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Loading…" : "Login"}
        </button>
      </form>
    </div>
  );
}
