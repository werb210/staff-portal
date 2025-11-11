import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/layout.css';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/applications', label: 'Applications' },
  { to: '/documents', label: 'Documents' },
  { to: '/lenders', label: 'Lenders' },
  { to: '/pipeline', label: 'Pipeline' },
  { to: '/notifications', label: 'Notifications' },
];

const Sidebar: FC = () => (
  <aside className="sidebar">
    <nav aria-label="Staff portal">
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                ['nav-link', isActive ? 'active' : null].filter(Boolean).join(' ')
              }
              end={link.to === '/'}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  </aside>
);

export default Sidebar;
