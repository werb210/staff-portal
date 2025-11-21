import { Outlet, NavLink } from "react-router-dom";
import LogoutButton from "@/components/auth/LogoutButton";

export default function LayoutShell() {
  return (
    <div className="flex w-full h-screen">
      <aside className="w-64 bg-gray-900 text-white p-4 flex flex-col gap-4">
        <NavLink to="/" className="hover:text-blue-300">Dashboard</NavLink>
        <NavLink to="/contacts" className="hover:text-blue-300">Contacts</NavLink>
        <NavLink to="/companies" className="hover:text-blue-300">Companies</NavLink>
        <NavLink to="/deals" className="hover:text-blue-300">Deals</NavLink>

        <div className="mt-auto">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
