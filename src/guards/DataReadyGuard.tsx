import type { PropsWithChildren } from "react";
import AppLoading from "@/components/layout/AppLoading";
import { useAuth } from "@/auth/AuthContext";

const DataReadyGuard = ({ children }: PropsWithChildren) => {
  const { authStatus, rolesStatus, user } = useAuth();

  if (authStatus === "loading" || rolesStatus === "loading") {
    return <AppLoading />;
  }

  if (authStatus === "authenticated" && !user) {
    return <AppLoading />;
  }

  return <>{children}</>;
};

export default DataReadyGuard;
