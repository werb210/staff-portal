import { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Applications from './pages/Applications';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Lenders from './pages/Lenders';
import Notifications from './pages/Notifications';
import Pipeline from './pages/Pipeline';
import './styles/layout.css';

const App: FC = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/lenders" element={<Lenders />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
