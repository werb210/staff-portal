import { Outlet, Link } from "react-router-dom";
import LogoutButton from "@/components/auth/LogoutButton";

export default function Layout() {
  return (
    <div className="flex h-screen">
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-4 space-y-4">
        <h1 className="text-xl font-bold">Boreal Staff</h1>

        <nav className="flex flex-col space-y-2">
          <Link to="/" className="hover:underline">Dashboard</Link>
          <Link to="/contacts" className="hover:underline">Contacts</Link>
          <Link to="/companies" className="hover:underline">Companies</Link>
          <Link to="/deals" className="hover:underline">Deals</Link>
        </nav>

        <div className="mt-auto">
          <LogoutButton />
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
