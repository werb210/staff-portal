import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PortalLayout from './layouts/PortalLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Applications from './pages/Applications/Applications';
import Documents from './pages/Documents/Documents';
import Lenders from './pages/Lenders/Lenders';
import Pipeline from './pages/Pipeline/Pipeline';
import CommunicationCenter from './pages/Communication/CommunicationCenter';
import AdminConsole from './pages/Admin/AdminConsole';
import AIPortal from './pages/AI/AIPortal';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

function App() {
  const { status } = useAuth();

  if (status === 'idle' || status === 'loading') {
    return <div className="splash">Loading staff portal...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PortalLayout />}>
          <Route
            index
            element={(
              <ProtectedRoute module="dashboard">
                <Dashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="applications"
            element={(
              <ProtectedRoute module="applications" required={['applications:create']}>
                <Applications />
              </ProtectedRoute>
            )}
          />
          <Route
            path="documents"
            element={(
              <ProtectedRoute module="documents" required="documents:review">
                <Documents />
              </ProtectedRoute>
            )}
          />
          <Route
            path="lenders"
            element={(
              <ProtectedRoute module="lenders" required="lenders:view">
                <Lenders />
              </ProtectedRoute>
            )}
          />
          <Route
            path="pipeline"
            element={(
              <ProtectedRoute module="pipeline" required="pipeline:view">
                <Pipeline />
              </ProtectedRoute>
            )}
          />
          <Route
            path="communication"
            element={(
              <ProtectedRoute module="communication" required={["communication:sms", "communication:email"]}>
                <CommunicationCenter />
              </ProtectedRoute>
            )}
          />
          <Route
            path="admin"
            element={(
              <ProtectedRoute module="admin" required={["admin:retry-queue", "admin:backups"]}>
                <AdminConsole />
              </ProtectedRoute>
            )}
          />
          <Route
            path="ai"
            element={(
              <ProtectedRoute module="ai" required={["ai:ocr", "ai:summarize"]}>
                <AIPortal />
              </ProtectedRoute>
            )}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
