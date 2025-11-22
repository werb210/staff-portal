import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { login } from "@/api/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();
    setError("");

    try {
      const data = await login(email, password);
      setAuth(data.token, data.user);

      navigate("/dashboard");
    } catch (err: any) {
      setError("Invalid credentials");
      console.error(err);
    }
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-96 space-y-4"
      >
        <h1 className="text-xl font-bold">Login</h1>

        <input
          className="w-full border p-2 rounded"
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

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button className="w-full p-2 bg-black text-white rounded">
          Login
        </button>
      </form>
    </div>
  );
}
