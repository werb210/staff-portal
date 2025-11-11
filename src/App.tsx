import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import Documents from './pages/Documents';
import Lenders from './pages/Lenders';
import Pipeline from './pages/Pipeline';
import Notifications from './pages/Notifications';
import Communication from './pages/Communication';
import RetryQueue from './pages/RetryQueue';

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => setDarkMode(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  return (
    <div className={`app-shell ${collapsed ? 'collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} openOnMobile={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />
      <div className="main-content">
        <Navbar
          onToggleSidebar={toggleSidebar}
          onToggleTheme={() => setDarkMode((prev) => !prev)}
          isDarkMode={darkMode}
        />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/lenders" element={<Lenders />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/communication" element={<Communication />} />
            <Route path="/retry-queue" element={<RetryQueue />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
