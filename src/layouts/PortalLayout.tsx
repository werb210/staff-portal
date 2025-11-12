import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Layout/Sidebar';
import { Topbar } from '../components/Layout/Topbar';
import ChatbotWidget from '../components/Chatbot/ChatbotWidget';
import { useOfflineQueue } from '../hooks/offline/useOfflineQueue';

export default function PortalLayout() {
  const { offlineQueue } = useOfflineQueue();

  return (
    <div className="layout">
      <Sidebar />
      <div className="layout__content">
        <Topbar />
        {offlineQueue.length > 0 && (
          <div className="offline-banner" role="status">
            Offline mode: {offlineQueue.length} action(s) queued.
          </div>
        )}
        <main className="layout__main" role="main">
          <Outlet />
        </main>
      </div>
      <ChatbotWidget />
    </div>
  );
}
