import { api } from "@/lib/http";

export interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

export async function listUsers() {
  const res = await api.get<User[]>("/users");
  return res.data;
}

export async function updateUserRole(id: string, role: string) {
  const res = await api.post(`/users/${id}/role`, { role });
  return res.data;
}
