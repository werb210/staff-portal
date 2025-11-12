import { usePortalStore } from '../../store/portalStore';
import { useAuthStore } from '../../store/authStore';
import { PortalButton } from '../Button/PortalButton';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

export function Topbar() {
  const { toggleSidebar } = usePortalStore();
  const navigate = useNavigate();
  const { user, clear, setStatus } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Failed to call logout endpoint', error);
    } finally {
      clear();
      setStatus('unauthenticated');
      navigate('/login');
    }
  };

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
        <PortalButton type="button" tone="ghost" className="topbar__signout" onClick={handleSignOut}>
          Sign out
        </PortalButton>
      </div>
    </header>
  );
}
