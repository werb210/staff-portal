import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import AppLayout from "./layouts/AppLayout";

// Temporary placeholder pages (Codex will replace each with real modules)
function Dashboard() { return <div>Dashboard</div>; }
function Contacts() { return <div>Contacts</div>; }
function Applications() { return <div>Applications</div>; }
function Documents() { return <div>Documents</div>; }
function Lenders() { return <div>Lenders</div>; }
function Reports() { return <div>Reports</div>; }

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/applications" element={<Applications />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/lenders" element={<Lenders />} />
                    <Route path="/reports" element={<Reports />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
