import React from "react";
import NavBar from "../components/NavBar";
import SideNav from "../components/SideNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <NavBar />
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-6 py-6">
        <aside className="w-56 shrink-0">
          <div className="sticky top-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <SideNav />
          </div>
        </aside>
        <main className="flex-1">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
