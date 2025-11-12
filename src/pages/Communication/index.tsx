import { NavLink, Outlet } from 'react-router-dom';

const CommunicationLayout = () => {
  return (
    <section className="page communication">
      <header className="page-header">
        <h2>Communication Center</h2>
        <p>Manage SMS, call logs, email outreach, and reusable templates.</p>
      </header>
      <nav className="tabs">
        <NavLink to="sms" end>
          SMS
        </NavLink>
        <NavLink to="calls">Calls</NavLink>
        <NavLink to="email">Email</NavLink>
        <NavLink to="templates">Templates</NavLink>
      </nav>
      <div className="tab-outlet">
        <Outlet />
      </div>
    </section>
  );
};

export default CommunicationLayout;
