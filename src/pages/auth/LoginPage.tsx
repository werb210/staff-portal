import { useState } from "react";
import api from "@/lib/api/http";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/api/users/login", {
        email,
        password
      });

      const { token, user } = res.data;
      setAuth(token, user);

      navigate("/dashboard");
    } catch (err: any) {
      setError("Invalid login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-96 bg-white p-8 shadow-md rounded"
      >
        <h1 className="text-2xl mb-6 font-semibold">Staff Login</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <input
          className="border p-2 w-full mb-4"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-4"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          className="w-full p-2 bg-black text-white rounded"
        >
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
}
