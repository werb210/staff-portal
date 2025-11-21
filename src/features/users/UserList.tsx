import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

import { deleteUser, getUsers } from "./UserService";
import { User } from "./UserTypes";

export default function UserList() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const queryClient = useQueryClient();

  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  function handleDelete(id: string) {
    const confirmDelete = window.confirm("Delete user?");
    if (!confirmDelete) return;

    deleteMutation.mutate(id);
  }

  if (isLoading) return <p>Loading users…</p>;

  if (isError)
    return (
      <p className="text-red-600">{error?.message || "Failed to load users"}</p>
    );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Users</h1>
        {isAdmin && (
          <Link
            to="/app/users/create"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            + Create User
          </Link>
        )}
      </div>

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Role</th>
              <th className="p-3 border">Created</th>
              {isAdmin && <th className="p-3 border w-40">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {users && users.length > 0 ? (
              users.map((u: User) => (
                <tr key={u.id} className="border-b">
                  <td className="p-3 border">{u.name || "—"}</td>
                  <td className="p-3 border">{u.email}</td>
                  <td className="p-3 border capitalize">{u.role}</td>
                  <td className="p-3 border">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  {isAdmin && (
                    <td className="p-3 border">
                      <Link
                        to={`/app/users/${u.id}`}
                        className="text-blue-600 hover:underline mr-4"
                      >
                        Edit
                      </Link>

                      <button
                        className="text-red-600 hover:underline disabled:opacity-50"
                        onClick={() => handleDelete(u.id)}
                        disabled={deleteMutation.isLoading}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-3 text-center" colSpan={isAdmin ? 5 : 4}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
