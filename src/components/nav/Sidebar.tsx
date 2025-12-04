import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-60 bg-white border-r h-screen p-4 space-y-2">
      <Link to="/notifications" className="sidebar-item flex items-center gap-2 py-2 px-3 rounded hover:bg-gray-100">
        <span className="material-icons">notifications</span>
        Notifications
      </Link>
    </aside>
  );
}
