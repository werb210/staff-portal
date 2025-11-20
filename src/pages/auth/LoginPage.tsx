import { FormEvent, useState } from "react";
import api from "../../lib/axios";
import { setToken } from "../../lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: FormEvent) {
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
    <form onSubmit={submit} className="space-y-4">
      {err && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Sign In
      </button>
    </form>
  );
}
