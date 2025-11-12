import { Routes, Route, Navigate } from 'react-router-dom';
import LayoutShell from './components/LayoutShell';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import Documents from './pages/Documents';
import Lenders from './pages/Lenders';
import Pipeline from './pages/Pipeline';
import Notifications from './pages/Notifications';
import Contacts from './pages/CRM/Contacts';
import Companies from './pages/CRM/Companies';
import Tasks from './pages/CRM/Tasks';
import RetryQueue from './pages/Admin/RetryQueue';
import Backups from './pages/Admin/Backups';

export default function App() {
  return (
    <LayoutShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/lenders" element={<Lenders />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/crm/contacts" element={<Contacts />} />
        <Route path="/crm/companies" element={<Companies />} />
        <Route path="/crm/tasks" element={<Tasks />} />
        <Route path="/admin/retry-queue" element={<RetryQueue />} />
        <Route path="/admin/backups" element={<Backups />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LayoutShell>
  );
}
