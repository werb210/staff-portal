// src/router.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ContactsPage from "./pages/crm/ContactsPage";
import LoginPage from "./pages/auth/LoginPage";

export default function AppRouter() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected */}
        {token ? (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/crm/contacts" element={<ContactsPage />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}
