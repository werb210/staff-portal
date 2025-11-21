import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AuthUser, useAuthStore } from "@/store/useAuthStore";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { user, token, isReady, setAuth, clearAuth } = useAuthStore();
  const initialHydrated = useAuthStore.persist.hasHydrated?.() ?? true;
  const [hydrating, setHydrating] = useState(!initialHydrated);

  useEffect(() => {
    const markReady = () => {
      useAuthStore.setState({ isReady: true });
      setHydrating(false);
    };

    if (useAuthStore.persist.hasHydrated?.() ?? false) {
      markReady();
      return;
    }

    const unsubFinish = useAuthStore.persist.onFinishHydration?.(() => {
      markReady();
    });

    if (!useAuthStore.persist.hasHydrated) {
      markReady();
      return unsubFinish;
    }

    useAuthStore.persist.rehydrate?.();

    return () => {
      unsubFinish?.();
    };
  }, []);

  const loading = hydrating || !isReady;

  const value = useMemo(
    () => ({ user, token, loading, setAuth, clearAuth }),
    [user, token, loading, setAuth, clearAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
