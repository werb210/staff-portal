import MainLayout from "../layouts/MainLayout";

export default function Dashboard() {
  return (
    <MainLayout>
      <div style={{ padding: 20 }}>
        <h1>Staff Dashboard</h1>
        <p>Protected content loads correctly.</p>
      </div>
    </MainLayout>
  );
}
