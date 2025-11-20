import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { logout } from "../lib/storage";

export default function AppLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar onLogout={handleLogout} />

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
