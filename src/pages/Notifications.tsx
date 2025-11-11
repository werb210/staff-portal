import { useEffect, useState } from 'react';
import api from '../services/api';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read?: boolean;
  [key: string]: unknown;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get<NotificationItem[]>('/api/notifications');
        setNotifications(data);
        setError(null);
      } catch (err) {
        setError('Unable to fetch');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <div>
          <h2>Notifications</h2>
          <p style={{ color: 'var(--color-muted)' }}>Real-time event feed from lending, documents, communications, and underwriting.</p>
        </div>
      </div>
      <div className="card" style={{ display: 'grid', gap: '1rem' }}>
        <h3>Live Feed</h3>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && notifications.length === 0 && <p>No notifications available.</p>}
        {!loading && !error &&
          notifications.map((notification) => (
            <div
              key={notification.id}
              style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.25)', paddingBottom: '1rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>{notification.title}</h4>
                <span className="status-pill">{notification.read ? 'Read' : 'New'}</span>
              </div>
              <p style={{ margin: '0.5rem 0', color: 'var(--color-muted)' }}>{notification.message}</p>
              <small style={{ color: 'var(--color-muted)' }}>{new Date(notification.created_at).toLocaleString()}</small>
            </div>
          ))}
      </div>
    </div>
  );
}
