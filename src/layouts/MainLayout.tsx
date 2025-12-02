import NavBar from "../components/NavBar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}>
      <NavBar />
      <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
    </div>
  );
}
