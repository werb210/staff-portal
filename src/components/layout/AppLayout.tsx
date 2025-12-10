import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "@/styles/globals.css";

const AppLayout = () => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__content">
        <Topbar />
        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
