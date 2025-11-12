import { NavLink } from 'react-router-dom';
import { MODULE_LABELS } from '../../config/rbac';
import type { PortalModule } from '../../types/rbac';
import { useRBAC } from '../../hooks/useRBAC';
import { usePortalStore } from '../../store/portalStore';

const MODULE_ROUTE_MAP: Record<PortalModule, string> = {
  dashboard: '/',
  applications: '/applications',
  documents: '/documents',
  lenders: '/lenders',
  pipeline: '/pipeline',
  communication: '/communication',
  admin: '/admin',
  ai: '/ai',
};

export function Sidebar() {
  const { user, canAccess } = useRBAC();
  const { sidebarOpen, setActiveModule } = usePortalStore();

  if (!user) return null;

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar__header">
        <strong>{user.silo} Portal</strong>
        <span>{user.role.toUpperCase()}</span>
      </div>
      <nav className="sidebar__nav">
        {(Object.keys(MODULE_ROUTE_MAP) as PortalModule[]).map((module) => {
          if (!canAccess(module)) {
            return null;
          }
          return (
            <NavLink
              key={module}
              to={MODULE_ROUTE_MAP[module]}
              className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}
              onClick={() => setActiveModule(module)}
            >
              {MODULE_LABELS[module]}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
