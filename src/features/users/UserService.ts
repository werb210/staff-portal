import api from "@/lib/api";
import { User, CreateUserPayload, UpdateUserPayload } from "./UserTypes";

export async function getUsers(): Promise<User[]> {
  const res = await api.get("/api/users");
  return res.data;
}

export async function getUser(id: string): Promise<User> {
  const res = await api.get(`/api/users/${id}`);
  return res.data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const res = await api.post("/api/users", payload);
  return res.data;
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<User> {
  const res = await api.put(`/api/users/${id}`, payload);
  return res.data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/api/users/${id}`);
}
