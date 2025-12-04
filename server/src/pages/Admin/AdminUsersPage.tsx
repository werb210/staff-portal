import { useQuery } from "@tanstack/react-query";
import { UsersAPI } from "@/api/users";

export default function AdminUsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => UsersAPI.list(),
  });

  if (isLoading) return <div>Loading users...</div>;

  const users = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Admin — Users</h1>
      <table className="min-w-full border bg-white">
        <thead>
          <tr className="bg-gray-100 text-left text-sm">
            <th className="px-3 py-2 border-b">Name</th>
            <th className="px-3 py-2 border-b">Email</th>
            <th className="px-3 py-2 border-b">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u.id} className="text-sm">
              <td className="px-3 py-2 border-b">{u.name}</td>
              <td className="px-3 py-2 border-b">{u.email}</td>
              <td className="px-3 py-2 border-b uppercase">{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
