import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import "@/styles/global.css";

export default function Layout() {
  return (
    <div className="bf-root">
      <Sidebar />
      <div className="bf-main">
        <TopBar />
        <main className="bf-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
