import { useEffect, useState } from 'react';
import api from '../services/api';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read?: boolean;
}

const POLL_INTERVAL = 15000;

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        const { data } = await api.get<NotificationItem[]>('/api/notifications');
        if (!isMounted) return;
        setNotifications(data);
        setUnreadCount(data.filter((item) => !item.read).length);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to fetch');
      }
    };

    fetchNotifications();
    const interval = window.setInterval(fetchNotifications, POLL_INTERVAL);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="notification-bell" style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          background: 'transparent',
          border: 'none',
          position: 'relative',
          cursor: 'pointer',
          color: 'inherit'
        }}
        aria-label="Notifications"
      >
        <span style={{ fontSize: '1.4rem' }}>🔔</span>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'var(--color-secondary)',
              color: '#fff',
              fontSize: '0.7rem',
              borderRadius: '999px',
              padding: '0.1rem 0.4rem'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="notification-panel"
          style={{
            position: 'absolute',
            right: 0,
            top: '2.5rem',
            width: '320px',
            maxHeight: '360px',
            overflowY: 'auto',
            background: 'var(--color-surface)',
            borderRadius: '12px',
            boxShadow: '0 18px 40px -22px rgba(15, 23, 42, 0.45)',
            padding: '1rem',
            zIndex: 30
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>Notifications</h4>
            <button
              type="button"
              onClick={() => {
                setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
                setUnreadCount(0);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Mark all read
            </button>
          </div>
          <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
            {error && <span style={{ color: 'var(--color-secondary)' }}>{error}</span>}
            {!error && notifications.length === 0 && <span>No notifications</span>}
            {notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  padding: '0.75rem',
                  background: notification.read ? 'transparent' : 'rgba(31, 111, 235, 0.1)',
                  borderRadius: '10px'
                }}
              >
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{notification.title}</strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-muted)' }}>{notification.message}</p>
                <small style={{ display: 'block', marginTop: '0.25rem', color: 'var(--color-muted)' }}>
                  {new Date(notification.created_at).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
