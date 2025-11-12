import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import Button from './Button';

interface NavbarProps {
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
}

export function Navbar({ onToggleSidebar, onToggleTheme, theme }: NavbarProps) {
  const { currentUser, notifications } = useAppContext();

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  return (
    <header className="navbar">
      <div className="navbar__section">
        <Button variant="ghost" onClick={onToggleSidebar} aria-label="Toggle navigation menu">
          ☰
        </Button>
        <Link to="/" className="navbar__logo">
          Staff Portal
        </Link>
      </div>
      <div className="navbar__section navbar__section--right">
        <Button variant="ghost" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? '🌙' : '☀️'}
        </Button>
        <Link to="/notifications" className="navbar__notifications" aria-label="Notifications">
          🔔
          {unreadCount > 0 && <span className="navbar__badge">{unreadCount}</span>}
        </Link>
        <div className="navbar__user">
          <div className="navbar__user-info">
            <span className="navbar__user-name">{currentUser?.name ?? 'Guest'}</span>
            <span className="navbar__user-silo">{currentUser?.silo ?? 'No silo'}</span>
          </div>
          {currentUser?.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt="Avatar" className="navbar__avatar" />
          ) : (
            <div className="navbar__avatar navbar__avatar--placeholder">{currentUser?.name?.charAt(0) ?? 'G'}</div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
