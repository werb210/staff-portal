import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUser, updateUser } from "./UserService";
import { UpdateUserPayload, UserRole } from "./UserTypes";

export default function UserEditForm() {
  const { id } = useParams();
  const nav = useNavigate();

  const [form, setForm] = useState<UpdateUserPayload>({
    name: "",
    role: "staff",
  });
  const [error, setError] = useState<string>("");

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id || ""),
    enabled: Boolean(id),
    onError: (err: any) => {
      setError(err?.response?.data?.message || "Failed to load user");
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateUser(id || "", payload),
    onSuccess: () => nav("/app/users"),
    onError: (err: any) => {
      setError(err?.response?.data?.message || "Failed to update user");
    },
  });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || "", role: user.role });
    }
  }, [user]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setError("");
    mutation.mutate(form);
  }

  if (!id) return <p className="text-red-600">User ID missing.</p>;
  if (isLoading) return <p>Loading…</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Edit User</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            className="border p-2 w-full rounded"
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Role</label>
          <select
            className="border p-2 w-full rounded"
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value as UserRole })
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
          {mutation.isLoading ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
