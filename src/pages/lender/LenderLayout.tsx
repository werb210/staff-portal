import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LenderLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div className="text-lg font-semibold tracking-tight">Lender Portal</div>
        <div className="space-x-3">
          <Button variant="ghost" size="sm">
            Switch Role
          </Button>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </div>
    </div>
  );
}
