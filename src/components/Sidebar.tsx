import { NavLink } from 'react-router-dom';

interface SidebarProps {
  collapsed: boolean;
  openOnMobile: boolean;
  onCloseMobile: () => void;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/applications', label: 'Applications', icon: '🗂️' },
  { path: '/documents', label: 'Documents', icon: '📄' },
  { path: '/lenders', label: 'Lenders', icon: '🏦' },
  { path: '/pipeline', label: 'Pipeline', icon: '🛤️' },
  { path: '/notifications', label: 'Notifications', icon: '🔔' },
  { path: '/communication', label: 'Communication', icon: '💬' },
  { path: '/retry-queue', label: 'Retry Queue', icon: '♻️' }
];

export default function Sidebar({ collapsed, openOnMobile, onCloseMobile }: SidebarProps) {
  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : ''} ${openOnMobile ? 'open' : ''}`}
      onClick={() => (openOnMobile ? onCloseMobile() : undefined)}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1.1rem'
            }}
          >
            BO
          </div>
          {!collapsed && (
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Boreal</h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-muted)' }}>Staff Operations</p>
            </div>
          )}
        </div>
      </div>
      <nav className="nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      {!collapsed && (
        <div style={{ marginTop: 'auto', background: 'rgba(31, 111, 235, 0.1)', padding: '1rem', borderRadius: '12px' }}>
          <h3 style={{ marginTop: 0 }}>Insights</h3>
          <p style={{ marginBottom: '0.75rem', color: 'var(--color-muted)' }}>
            Monitor lending KPIs and trigger automations across the Boreal ecosystem.
          </p>
          <button
            type="button"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--color-primary)',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            View Reports
          </button>
        </div>
      )}
    </aside>
  );
}
