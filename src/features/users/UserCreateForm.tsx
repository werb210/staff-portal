import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "./UserService";
import { CreateUserPayload, UserRole } from "./UserTypes";

export default function UserCreateForm() {
  const nav = useNavigate();
  const [form, setForm] = useState<CreateUserPayload>({
    email: "",
    password: "",
    name: "",
    role: "staff",
  });
  const [error, setError] = useState<string>("");

  const mutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => nav("/app/users"),
    onError: (err: any) => {
      setError(err?.response?.data?.message || "Failed to create user");
    },
  });

  function updateField<T extends keyof CreateUserPayload>(
    key: T,
    value: CreateUserPayload[T]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    mutation.mutate(form);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Create User</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            className="border p-2 w-full rounded"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            required
            type="email"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            className="border p-2 w-full rounded"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            className="border p-2 w-full rounded"
            value={form.name || ""}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Role</label>
          <select
            className="border p-2 w-full rounded"
            value={form.role}
            onChange={(e) =>
              updateField("role", e.target.value as UserRole)
            }
          >
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="lender">Lender</option>
            <option value="referrer">Referrer</option>
          </select>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={mutation.isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {mutation.isLoading ? "Creating…" : "Create User"}
        </button>
      </form>
    </div>
  );
}
