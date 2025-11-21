import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

const ROLE_REDIRECTS: Record<string, string> = {
  admin: "/admin",
  staff: "/dashboard",
  lender: "/lender",
  referrer: "/referrer",
};

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const role = useAuthStore((state) => state.role);
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const destination = useMemo(() => {
    if (!role) return null;
    const normalized = role.toLowerCase?.() ?? role;
    return ROLE_REDIRECTS[normalized] ?? "/dashboard";
  }, [role]);

  useEffect(() => {
    if (token && destination) {
      navigate(destination, { replace: true });
    }
  }, [destination, navigate, token]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      const userRole = (await login(email, password))?.toLowerCase?.();
      const redirectPath = userRole ? ROLE_REDIRECTS[userRole] ?? "/dashboard" : "/dashboard";
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow p-8 rounded w-96 space-y-4"
      >
        <h1 className="text-xl font-bold">Staff Login</h1>

        {error && <p className="text-red-600">{error}</p>}

        <input
          type="email"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded p-2"
        >
          Login
        </button>
      </form>
    </div>
  );
}
