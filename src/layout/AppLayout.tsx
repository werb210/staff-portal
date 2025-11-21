import { Outlet } from "react-router-dom";
import Sidebar from "../ui/Sidebar";
import HeaderBar from "../ui/HeaderBar";

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <HeaderBar />
        <main className="p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
