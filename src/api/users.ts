import api from "./client";

export type User = {
  id: string;
  phone: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: "Admin" | "Staff" | "Lender" | "Referrer";
  status: "active" | "disabled";
  silo: string;
  created_at: string;
  last_login_at: string | null;
};

export async function getUsers(params?: { role?: string; status?: string }) {
  return api.get<{ users: User[] }>("/users", { params });
}

export async function updateUser(
  id: string,
  data: Partial<Pick<User, "role" | "status">>
) {
  return api.patch(`/users/${id}`, data);
}

export async function getMe() {
  return api.get<{ user: User }>("/users/me");
}

export async function updateMe(data: {
  email?: string;
  first_name?: string;
  last_name?: string;
}) {
  return api.patch("/users/me", data);
}
