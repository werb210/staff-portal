import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { Button } from '../components/common/Button';

interface NavItem {
  label: string;
  path: string;
  roles?: Array<'Admin' | 'Staff' | 'Lender'>;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/' },
  { label: 'Contacts', path: '/contacts' },
  { label: 'Pipeline', path: '/pipeline' },
  { label: 'Documents', path: '/documents' },
  { label: 'Communication', path: '/communication' },
  { label: 'Lender Products', path: '/lender-products', roles: ['Admin', 'Lender'] },
  { label: 'Settings', path: '/settings' },
];

const filterNavItems = (items: NavItem[], role: 'Admin' | 'Staff' | 'Lender'): NavItem[] =>
  items.filter((item) => !item.roles || item.roles.includes(role));

const Topbar = ({ children }: { children: ReactNode }) => <div className="layout-topbar">{children}</div>;

const Sidebar = ({ children }: { children: ReactNode }) => <nav className="layout-sidebar">{children}</nav>;

const Content = ({ children }: { children: ReactNode }) => <main className="layout-content">{children}</main>;

const StaffLayout = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const navItems = useMemo(() => (user ? filterNavItems(NAV_ITEMS, user.role) : []), [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="layout">
      <Sidebar>
        <div className="sidebar-header">
          <h1>Staff Portal</h1>
          <p>{user.name}</p>
          <span className="role">{user.role}</span>
        </div>
        <ul className="sidebar-menu">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink to={item.path} end className={({ isActive }) => (isActive ? 'active' : undefined)}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </Sidebar>
      <div className="layout-body">
        <Topbar>
          <div className="topbar-left">Welcome back, {user.name}</div>
          <div className="topbar-right">
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Topbar>
        <Content>
          <Outlet />
        </Content>
      </div>
    </div>
  );
};

export default StaffLayout;
