import { useState, type FormEvent } from "react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const ok = await login(email, password);

    if (!ok) {
      setError("Invalid credentials");
      return;
    }

    const role = useAuthStore.getState().role;

    if (role === "admin") navigate("/admin");
    else navigate("/dashboard");
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <form
        onSubmit={submit}
        className="w-[320px] space-y-4 border p-6 rounded-xl shadow"
      >
        <h1 className="text-xl font-bold">Staff Portal Login</h1>

        {error && <p className="text-red-600">{error}</p>}

        <input
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />

        <input
          className="w-full border p-2 rounded"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}
