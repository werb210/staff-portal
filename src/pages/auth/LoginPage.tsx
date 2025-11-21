import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { http } from "@/lib/http";

export default function LoginPage() {
  const { setUserAndToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();
    setError("");

    try {
      const res = await http.post("/api/auth/login", { email, password });
      const { token, user } = res.data;

      setUserAndToken(token, user);

      window.location.href = "/";
    } catch (err: any) {
      setError("Invalid credentials.");
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <form className="bg-white shadow p-8 w-96 space-y-4" onSubmit={handleSubmit}>
        <h1 className="text-xl font-semibold">Login</h1>

        <input
          className="border w-full p-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border w-full p-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500">{error}</p>}

        <button className="bg-blue-600 text-white p-2 w-full">Login</button>
      </form>
    </div>
  );
}
