import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white p-4">
        <h1 className="text-xl font-bold mb-6">Boreal Staff</h1>

        <nav className="space-y-2">
          <a href="/" className="block p-2 rounded hover:bg-gray-700">Dashboard</a>
          <a href="/applications" className="block p-2 rounded hover:bg-gray-700">Applications</a>
          <a href="/logout" className="block p-2 rounded hover:bg-gray-700">Logout</a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
