import { useEffect } from "react";
import { clearToken } from "../lib/auth";

export default function Logout() {
  useEffect(() => {
    clearToken();
    window.location.href = "/login";
  }, []);

  return <p className="p-6">Logging out…</p>;
}
