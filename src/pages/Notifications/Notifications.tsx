import { NotificationCenter } from '../../components/Notification/NotificationCenter';
import { useNotifications, useDispatchNotification, useSubscribeToPush } from '../../hooks/api/useNotifications';

export default function Notifications() {
  const { data: notifications = [], isLoading, isError } = useNotifications();
  const dispatchNotification = useDispatchNotification();
  const subscribeToPush = useSubscribeToPush();

  return (
    <div className="page notifications">
      <section className="card">
        <header className="card__header">
          <h1>Notifications</h1>
          {isLoading && <span>Loading…</span>}
        </header>
        {isError && <p className="error">Unable to load notifications for this silo.</p>}
        <NotificationCenter
          notifications={notifications}
          onDispatch={(payload) => dispatchNotification.mutate(payload)}
          isDispatching={dispatchNotification.isPending}
          onSubscribePush={(subscription) =>
            subscribeToPush.mutate({ endpoint: subscription.endpoint, keys: subscription.keys })
          }
          isSubscribing={subscribeToPush.isPending}
        />
      </section>
    </div>
  );
}
