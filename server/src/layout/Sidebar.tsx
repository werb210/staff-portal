import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">Boreal</div>

      <nav>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/contacts">Contacts</NavLink>
        <NavLink to="/companies">Companies</NavLink>
        <NavLink to="/deals">Deals</NavLink>
        <NavLink to="/applications">Applications</NavLink>
        <NavLink to="/pipeline">Pipeline</NavLink>
        <NavLink to="/documents">Documents</NavLink>
        <NavLink to="/lenders">Lenders</NavLink>
        <NavLink to="/marketing">Marketing</NavLink>
        <NavLink to="/referrals">Referrals</NavLink>
        <NavLink to="/admin/users">Admin</NavLink>
      </nav>
    </div>
  );
}
