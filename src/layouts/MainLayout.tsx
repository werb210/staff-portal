import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}>
      <NavBar />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Sidebar />

        <div style={{ flex: 1, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}
