import React from "react";
import NotificationBell from "../components/nav/NotificationBell";

interface AppLayoutProps {
  currentUser?: any;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

export default function AppLayout({ currentUser, sidebar, children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {sidebar}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
          <div className="text-xl font-bold">Staff Portal</div>
          <NotificationBell user={currentUser} />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
