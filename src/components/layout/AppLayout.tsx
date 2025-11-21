import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import { useNavStore } from "@/store/navStore";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children?: React.ReactNode }) {
  const mobileOpen = useNavStore((s) => s.open);
  const setOpen = useNavStore((s) => s.setOpen);

  return (
    <div className="min-h-screen bg-gray-50 md:pl-16">
      <Sidebar />

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        >
          <div className={cn("h-full w-64 bg-white p-4 shadow-xl")}>{<Sidebar />}</div>
        </div>
      )}

      <div className="flex min-h-screen flex-col">
        <TopNav />
        <main className="flex-1 p-6">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
