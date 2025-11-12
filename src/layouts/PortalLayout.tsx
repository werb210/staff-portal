import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Layout/Sidebar';
import { Topbar } from '../components/Layout/Topbar';
import ChatbotWidget from '../components/Chatbot/ChatbotWidget';
import { useOfflineQueue } from '../hooks/offline/useOfflineQueue';
import { NotificationBanner } from '../components/Notification/NotificationBanner';

export default function PortalLayout() {
  const { offlineQueue } = useOfflineQueue();

  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="layout__content">
        <Topbar />
        {offlineQueue.length > 0 && (
          <div className="layout__notification">
            <NotificationBanner
              tone="warning"
              message={`Offline mode: ${offlineQueue.length} action(s) queued.`}
              actionLabel="Retry now"
              onAction={handleRetry}
            />
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
