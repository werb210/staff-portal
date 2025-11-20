import { useState } from "react";
import { login } from "./api";
import { saveAuth } from "../../lib/storage";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const nav = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const { token, role } = await login(form);
      saveAuth(token, role);
      nav("/app/dashboard");
    } catch (err: any) {
      setError("Invalid credentials");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8">
      <form onSubmit={handleSubmit} className="bg-white p-8 w-full max-w-sm rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Staff Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-3"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {error && <p className="text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
