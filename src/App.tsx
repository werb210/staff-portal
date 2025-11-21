import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginPage from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import MainLayout from "./components/layout/MainLayout";

// Temp placeholder pages
const Dashboard = () => <div>Dashboard</div>;
const Applications = () => <div>Applications</div>;
const Contacts = () => <div>Contacts</div>;
const Companies = () => <div>Companies</div>;
const Deals = () => <div>Deals</div>;
const Lenders = () => <div>Lenders</div>;
const Reports = () => <div>Reports</div>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* PROTECTED */}
        <Route
          path="/"
          element={
            <ProtectedRoute roles={["admin", "staff", "lender"]}>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications"
          element={
            <ProtectedRoute roles={["admin", "staff"]}>
              <MainLayout>
                <Applications />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/contacts"
          element={
            <ProtectedRoute roles={["admin", "staff"]}>
              <MainLayout>
                <Contacts />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/companies"
          element={
            <ProtectedRoute roles={["admin", "staff"]}>
              <MainLayout>
                <Companies />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/deals"
          element={
            <ProtectedRoute roles={["admin", "staff"]}>
              <MainLayout>
                <Deals />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/lenders"
          element={
            <ProtectedRoute roles={["admin"]}>
              <MainLayout>
                <Lenders />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute roles={["admin"]}>
              <MainLayout>
                <Reports />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  );
}
