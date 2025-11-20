import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex h-screen">
      <aside className="w-60 bg-gray-900 text-white p-4 space-y-4">
        <h1 className="text-xl font-bold mb-4">Boreal Staff</h1>

        <nav className="space-y-2">
          <a href="/" className="block hover:bg-gray-700 p-2 rounded">Dashboard</a>
          <a href="/logout" className="block hover:bg-gray-700 p-2 rounded">Logout</a>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
