import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
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
