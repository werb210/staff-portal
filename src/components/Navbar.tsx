import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';

interface NavbarProps {
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

export default function Navbar({ onToggleSidebar, onToggleTheme, isDarkMode }: NavbarProps) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        background: 'var(--color-surface)',
        borderBottom: '1px solid rgba(17, 24, 39, 0.08)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(31, 111, 235, 0.15)',
            color: 'var(--color-primary)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.25rem'
          }}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.35rem' }}>Boreal Staff Portal</h1>
          <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.9rem' }}>
            Operational control center &mdash; real-time lending intelligence
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div
          className="dark-mode-toggle"
          onClick={onToggleTheme}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onToggleTheme();
            }
          }}
        >
          <span>{isDarkMode ? '🌙' : '🌞'}</span>
          <span>{isDarkMode ? 'Dark' : 'Light'}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '999px',
              border: 'none',
              background: 'var(--color-primary)',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            New Application
          </button>
          <button
            type="button"
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '999px',
              border: '1px solid rgba(148, 163, 184, 0.45)',
              background: 'transparent',
              color: 'var(--color-primary)',
              cursor: 'pointer'
            }}
          >
            Quick Task
          </button>
        </div>
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
