import { useState } from "react";
import { useApiPost } from "../lib/api/mutations";
import { useAuthStore } from "../lib/auth/useAuthStore";

export default function LoginPage() {
  const loginMutation = useApiPost<{ token: string; user: any }>("/api/auth/login");
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();

    const result = await loginMutation.mutateAsync({ email, password });
    login(result.token, result.user);
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="p-6 border rounded w-80 flex flex-col gap-4">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
