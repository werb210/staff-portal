import { useAuthStore } from "../lib/auth/useAuthStore";
import { Sidebar } from "../ui/layout/Sidebar";
import { Header } from "../ui/layout/Header";
import { Navigate } from "react-router-dom";

export default function AppLayout({ children }: { children: JSX.Element }) {
  const token = useAuthStore((s) => s.token);

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="flex w-full h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
