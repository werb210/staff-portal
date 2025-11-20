import { Outlet, NavLink } from "react-router-dom";
import LogoutButton from "./components/LogoutButton";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* TOP NAV */}
      <header className="bg-white shadow flex justify-between items-center px-6 py-4">
        <h1 className="text-xl font-semibold">Boreal Staff Portal</h1>

        <nav className="flex items-center gap-6">
          <NavLink
            to="/app/dashboard"
            className={({ isActive }) =>
              isActive ? "font-bold text-blue-600" : "text-gray-700"
            }
          >
            Dashboard
          </NavLink>

          <LogoutButton />
        </nav>
      </header>

      {/* CONTENT */}
      <main className="flex-1 bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}
