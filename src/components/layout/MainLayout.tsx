import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-screen flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Right Side */}
      <div className="flex flex-col flex-1">
        <Topbar />
        <div className="flex-1 overflow-auto bg-gray-50 p-4">{children}</div>
      </div>
    </div>
  );
}
