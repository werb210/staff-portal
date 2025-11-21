import { Outlet } from "react-router-dom";
import Sidebar from "@/components/navigation/Sidebar";
import Topbar from "@/components/navigation/Topbar";

export default function AppLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 pl-16 md:pl-64">
      <Sidebar />
      <div className="ml-0 flex min-h-screen flex-col md:ml-64">
        <Topbar />
        <main className="flex-1 p-6">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
