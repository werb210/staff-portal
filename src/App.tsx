import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./auth/AuthContext"
import ProtectedRoute from "./routes/ProtectedRoute"
import LoginPage from "./pages/LoginPage"

// REMOVE broken Dashboard import
// REMOVE broken LenderPage import

function Dashboard() {
  return <div>Dashboard</div>
}

function Lenders() {
  return <div>Protected</div>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lenders/*"
            element={
              <ProtectedRoute>
                <Lenders />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
