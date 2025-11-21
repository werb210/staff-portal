import { Outlet } from "react-router-dom";
import SidebarNav from "../ui/SidebarNav";
import TopBar from "../ui/TopBar";

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <SidebarNav />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <TopBar />

        <main className="p-6 overflow-auto flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
