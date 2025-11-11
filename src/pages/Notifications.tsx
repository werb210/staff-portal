import { FC } from 'react';
import { useApiData } from '../hooks/useApiData';
import '../styles/layout.css';

type Notification = {
  id: string;
  message: string;
  createdAt: string;
};

type NotificationsResponse = {
  notifications: Notification[];
};

const Notifications: FC = () => {
  const { data, loading, error } = useApiData<NotificationsResponse>('/notifications', {
    notifications: [],
  });

  return (
    <section className="page-card">
      <h2>Notifications</h2>
      <p>Stay up to date on key borrower and lender activity.</p>
      {loading && <p>Loading notifications…</p>}
      {error && <p role="alert">Failed to load notifications: {error}</p>}
      {!loading && data && (
        <ul>
          {data.notifications.length === 0 && <li>No notifications yet.</li>}
          {data.notifications.map((notification) => (
            <li key={notification.id}>
              <strong>{new Date(notification.createdAt).toLocaleString()}</strong> — {notification.message}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Notifications;
