import { useAuth } from "@/hooks/useAuth";
import { useSilo } from "@/hooks/useSilo";
import { getRoleLabel } from "@/utils/roles";
import Button from "../ui/Button";
import SiloSelector from "./SiloSelector";

const Topbar = () => {
  const { user, logout } = useAuth();
  const { silo } = useSilo();

  return (
    <header className="topbar">
      <div className="topbar__left">
        <h1 className="topbar__title">Staff Portal</h1>
        <span className="topbar__subtitle">Silo: {silo}</span>
      </div>
      <div className="topbar__right">
        <SiloSelector />
        {user && (
          <div className="topbar__user">
            <div>
              <div className="topbar__user-name">{user.name}</div>
              <div className="topbar__user-role">{getRoleLabel(user.role)}</div>
            </div>
            <Button variant="secondary" onClick={logout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
