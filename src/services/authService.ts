import { UserRole } from "@/lib/auth/useAuthStore";

type LoginPayload = { email: string; password: string };

const mockPermissions: Record<UserRole, string[]> = {
  admin: ["*"],
  staff: ["pipeline", "contacts", "documents", "settings"],
  marketing: ["marketing", "analytics"],
  lender: ["lender"],
  referrer: ["referrer"],
};

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
};

const fakeFetch = async <T>(result: T, delay = 600): Promise<T> => {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return result;
};

export async function login(payload: LoginPayload) {
  const domain = payload.email.split("@")[1] ?? "staff";
  const role: UserRole = (domain.replace(/\..*/, "") as UserRole) || "staff";
  const user: SessionUser = {
    id: crypto.randomUUID(),
    name: payload.email.split("@")[0] ?? "User",
    email: payload.email,
    role,
    permissions: mockPermissions[role] ?? [],
  };

  const token = btoa(`${user.id}:${user.role}`);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString();

  return fakeFetch({ user, token, expiresAt });
}

export async function logout() {
  localStorage.removeItem("staff_portal_token");
  return fakeFetch({ success: true }, 200);
}

export async function forgotPassword(payload: { email: string }) {
  return fakeFetch({ success: true, email: payload.email });
}

export async function resetPassword(payload: { token: string; password: string }) {
  return fakeFetch({ success: true, token: payload.token });
}

export async function verifyToken(token: string | null) {
  if (!token) throw new Error("Missing token");
  const decoded = atob(token).split(":");
  const role = decoded[1] as UserRole;
  const user: SessionUser = {
    id: decoded[0] ?? crypto.randomUUID(),
    name: "Restored User",
    email: "session@staffportal.com",
    role,
    permissions: mockPermissions[role] ?? [],
  };
  return fakeFetch({ user, token, expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString() });
}
