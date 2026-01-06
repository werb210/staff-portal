import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginService } from "@/services/auth";
import { setStoredAccessToken } from "@/services/token";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const result = await loginService(email, password);
      setStoredAccessToken(result.accessToken);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 401) {
        setError("Invalid credentials");
      } else {
        setError(err instanceof Error ? err.message : "Authentication failed");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Staff Login</h1>

      {error && (
        <div role="alert" className="text-sm text-red-700">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col space-y-1">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded px-4 py-2"
        >
          Login
        </button>
      </form>
    </div>
  );
}
