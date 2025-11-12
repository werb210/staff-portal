import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Applications from './pages/Applications/Applications';
import Documents from './pages/Documents/Documents';
import Lenders from './pages/Lenders/Lenders';
import Notifications from './pages/Notifications/Notifications';
import CRM from './pages/CRM/CRM';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/lenders" element={<Lenders />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/crm" element={<CRM />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
