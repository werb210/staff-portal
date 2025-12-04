import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TopBar />
        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
