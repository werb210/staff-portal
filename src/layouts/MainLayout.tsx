import type { ReactNode } from "react";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bf-app-layout">
      <NavBar />

      <div className="bf-main">
        <Sidebar />

        <div className="bf-content">{children}</div>
      </div>
    </div>
  );
}
