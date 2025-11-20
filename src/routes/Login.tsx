import { useState } from "react";
import api from "../lib/axios";
import { setToken } from "../lib/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: any) {
    e.preventDefault();
    setErr("");

    try {
      const res = await api.post("/api/auth/login", { email, password });
      setToken(res.data.token);
      window.location.href = "/";
    } catch (error: any) {
      setErr(error?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <form
        onSubmit={submit}
        className="bg-white shadow p-6 rounded w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold">Staff Login</h1>

        {err && (
          <div className="text-sm text-red-600 bg-red-100 p-2 rounded">
            {err}
          </div>
        )}

        <input
          className="w-full border p-2 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}
