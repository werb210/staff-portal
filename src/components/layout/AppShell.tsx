import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../lib/storage";

type Props = {
  children: ReactNode;
};

export function AppShell({ children }: Props) {
  const nav = useNavigate();

  function handleLogout() {
    logout();
    nav("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-14 border-b bg-white flex items-center justify-between px-4">
        <div className="font-semibold">Boreal Staff Portal</div>
        <button
          onClick={handleLogout}
          className="text-sm border px-3 py-1 rounded hover:bg-gray-100"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
