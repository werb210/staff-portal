import http from "../../lib/api/http";
import { User, CreateUserPayload, UpdateUserPayload } from "./UserTypes";

export async function getUsers(): Promise<User[]> {
  const res = await http.get("/api/users");
  return res.data;
}

export async function getUser(id: string): Promise<User> {
  const res = await http.get(`/api/users/${id}`);
  return res.data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const res = await http.post("/api/users", payload);
  return res.data;
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<User> {
  const res = await http.put(`/api/users/${id}`, payload);
  return res.data;
}

export async function deleteUser(id: string): Promise<void> {
  await http.delete(`/api/users/${id}`);
}
