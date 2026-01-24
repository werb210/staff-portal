import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useLenderAuth } from "@/lender/auth/useLenderAuth";
import "@/styles/globals.css";
import "@/styles/lender.css";

const LenderLayout = () => {
  const { user, logout } = useLenderAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/lender/login");
  };

  return (
    <div className="lender-shell">
      <aside className="lender-sidebar">
        <div className="lender-sidebar__brand">
          <div className="lender-sidebar__logo" aria-hidden>⛰️</div>
          <div>
            <div className="lender-sidebar__title">Lender Portal</div>
            <div className="lender-sidebar__subtitle">{user?.companyName ?? ""}</div>
          </div>
        </div>
        <nav className="lender-sidebar__nav">
          <NavLink
            to="/lender/products"
            className={({ isActive }) =>
              isActive ? "lender-nav-link lender-nav-link--active" : "lender-nav-link"
            }
          >
            My Products
          </NavLink>
        </nav>
      </aside>
      <div className="lender-shell__content">
        <header className="lender-topbar">
          <div>
            <div className="lender-topbar__title">Welcome back</div>
            <div className="lender-topbar__subtitle">Manage your lender profile and offers</div>
          </div>
          <div className="lender-topbar__user">
            <div className="lender-avatar">{user?.name?.[0] ?? "L"}</div>
            <div className="lender-topbar__user-meta">
              <span className="lender-topbar__user-name">{user?.name}</span>
              <span className="lender-topbar__user-role">Lender</span>
            </div>
            <button className="ui-button ui-button--ghost" onClick={handleLogout} type="button">
              Logout
            </button>
          </div>
        </header>
        <main className="lender-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LenderLayout;
