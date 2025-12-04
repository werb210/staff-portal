import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/state/authStore";

export default function NavBar() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  function doLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="menu">
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
      </div>
      <button onClick={doLogout}>Logout</button>
    </nav>
  );
}
