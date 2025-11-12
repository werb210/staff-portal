import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

interface SidebarProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

const mainLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/applications', label: 'Applications' },
  { to: '/documents', label: 'Documents' },
  { to: '/lenders', label: 'Lenders' },
  { to: '/pipeline', label: 'Pipeline' }
];

const crmLinks = [
  { to: '/crm/contacts', label: 'Contacts' },
  { to: '/crm/companies', label: 'Companies' },
  { to: '/crm/tasks', label: 'Tasks' }
];

const adminLinks = [
  { to: '/admin/retry-queue', label: 'Retry Queue' },
  { to: '/admin/backups', label: 'Backups' }
];

export function Sidebar({ collapsed = false, onNavigate }: SidebarProps) {
  return (
    <aside className={clsx('sidebar', { 'sidebar--collapsed': collapsed })}>
      <nav>
        <div className="sidebar__section">
          <h3>Main</h3>
          <ul>
            {mainLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={onNavigate}
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="sidebar__section">
          <h3>CRM</h3>
          <ul>
            {crmLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={onNavigate}
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="sidebar__section">
          <h3>Admin</h3>
          <ul>
            {adminLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={onNavigate}
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
