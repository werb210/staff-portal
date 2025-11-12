import { usePortalStore } from '../../store/portalStore';
import { useAuthStore } from '../../store/authStore';

export function Topbar() {
  const { toggleSidebar } = usePortalStore();
  const { user } = useAuthStore();

  return (
    <header className="topbar">
      <button className="topbar__menu" aria-label="Toggle navigation" onClick={toggleSidebar}>
        ☰
      </button>
      <div className="topbar__meta">
        <div>
          <h1>Boreal Staff Portal</h1>
          <p>Operational control center for all silos</p>
        </div>
      </div>
      <div className="topbar__user">
        <span>{user?.name}</span>
        <small>{user?.email}</small>
      </div>
    </header>
  );
}
