import { useEffect, useState } from "react";
import { decodeJwt, JwtPayload } from "./jwt";

type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: JwtPayload };

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const decoded = decodeJwt(token);

    if (!decoded) {
      setState({ status: "unauthenticated" });
      return;
    }

    setState({ status: "authenticated", user: decoded });
  }, []);

  return state;
}
