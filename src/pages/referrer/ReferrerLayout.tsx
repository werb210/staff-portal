import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ReferrerLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div className="text-lg font-medium tracking-tight">Referrer Portal</div>
        <Button variant="ghost" size="sm">
          Switch Role
        </Button>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </div>
    </div>
  );
}
