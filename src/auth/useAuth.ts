import { useEffect, useState } from "react";
import type { JwtPayload } from "./jwt";
import { decodeJwt, getAuthToken } from "./token";

type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: JwtPayload };

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const token = getAuthToken();
    const decoded = decodeJwt(token ?? undefined) as JwtPayload | null;

    if (!decoded) {
      setState({ status: "unauthenticated" });
      return;
    }

    setState({ status: "authenticated", user: decoded });
  }, []);

  return state;
}
