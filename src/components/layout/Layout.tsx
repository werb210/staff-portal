import { Outlet } from "react-router-dom";
import NavBar from "../NavBar";
import Sidebar from "../Sidebar";

export default function Layout() {
  return (
    <div className="bf-app-layout">
      <NavBar />

      <div className="bf-main">
        <Sidebar />

        <main className="bf-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
