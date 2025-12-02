import React from "react";
import NavBar from "../components/NavBar";
import SideNav from "../components/SideNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <SideNav />

      <div className="flex flex-col flex-1 overflow-hidden">
        <NavBar />

        <main className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
