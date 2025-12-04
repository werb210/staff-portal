import { Outlet } from "react-router-dom";
import Sidebar from "@/nav/Sidebar";
import NotificationBell from "@/nav/NotificationBell";

export default function MainLayout() {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <NotificationBell />
        </div>
        <div className="p-4 flex-1 overflow-auto bg-white">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
