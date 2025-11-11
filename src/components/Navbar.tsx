import { FC } from 'react';
import '../styles/layout.css';

const Navbar: FC = () => {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="navbar">
      <h1>Staff Portal</h1>
      <div className="navbar-actions">
        <span>{today}</span>
        <div className="user-chip">
          <span role="img" aria-label="User">
            👩‍💼
          </span>
          <span>Alex Morgan</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
