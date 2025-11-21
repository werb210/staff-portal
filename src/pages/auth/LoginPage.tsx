import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { pushToast } from "@/components/ui/toast";
import { authStore, Role } from "@/lib/auth/authStore";
import { login } from "@/lib/auth/login";

const ROLE_REDIRECTS: Record<Role, string> = {
  admin: "/admin",
  staff: "/dashboard",
  lender: "/lender",
  referrer: "/referrer",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = authStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const destination = useMemo(() => {
    const role = user?.role?.toLowerCase?.() as Role | undefined;
    if (!role) return null;
    return ROLE_REDIRECTS[role] ?? "/dashboard";
  }, [user?.role]);

  useEffect(() => {
    if (isAuthenticated && destination) {
      navigate(destination, { replace: true });
    }
  }, [destination, isAuthenticated, navigate]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { success } = await login(email, password);
      if (success) {
        const nextRole = authStore.getState().user?.role as Role | undefined;
        const redirectPath = nextRole ? ROLE_REDIRECTS[nextRole] : "/dashboard";
        pushToast({
          title: "Welcome",
          description: "You have been signed in.",
          variant: "success",
        });
        navigate(redirectPath, { replace: true });
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Login failed";
      setError(message);
      pushToast({
        title: "Authentication failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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
          required
        />

        <input
          type="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded p-2 disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
