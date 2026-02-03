import type { PropsWithChildren } from "react";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";

const ReferrerLayout = ({ children }: PropsWithChildren) => {
  const { user, logout } = useAuth();

  return (
    <div className="referrer-layout">
      <header className="referrer-header">
        <div>
          <div className="referrer-header__title">Referrer Portal</div>
          {user?.name && <div className="referrer-header__subtitle">Welcome, {user.name}</div>}
        </div>
        <Button type="button" variant="ghost" onClick={logout}>
          Logout
        </Button>
      </header>
      <main className="referrer-main">{children}</main>
    </div>
  );
};

export default ReferrerLayout;
