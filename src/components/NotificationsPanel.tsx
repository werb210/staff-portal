import Button from './Button';
import { useAppContext } from '../contexts/AppContext';

export function NotificationsPanel() {
  const { notifications, markNotificationRead, dismissNotification } = useAppContext();

  if (!notifications.length) {
    return <div className="notifications notifications--empty">No notifications yet.</div>;
  }

  return (
    <ul className="notifications">
      {notifications.map((notification) => (
        <li key={notification.id} className={`notifications__item notifications__item--${notification.severity}`}>
          <div className="notifications__content">
            <h3>{notification.title}</h3>
            <p>{notification.message}</p>
            <small>{new Date(notification.createdAt).toLocaleString()}</small>
          </div>
          <div className="notifications__actions">
            {!notification.read && (
              <Button variant="secondary" onClick={() => markNotificationRead(notification.id)}>
                Mark read
              </Button>
            )}
            <Button variant="ghost" onClick={() => dismissNotification(notification.id)}>
              Dismiss
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default NotificationsPanel;
