import { useState } from 'react';
import type { NotificationDispatchPayload, NotificationRecord, NotificationChannel } from '../../types/notifications';

interface NotificationCenterProps {
  notifications: NotificationRecord[];
  onDispatch: (payload: NotificationDispatchPayload) => void;
  isDispatching: boolean;
  onSubscribePush?: (subscription: PushSubscriptionInit) => void;
  isSubscribing?: boolean;
}

interface PushSubscriptionInit {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

const channelOptions: NotificationChannel[] = ['email', 'sms', 'push'];

export function NotificationCenter({
  notifications,
  onDispatch,
  isDispatching,
  onSubscribePush,
  isSubscribing,
}: NotificationCenterProps) {
  const [form, setForm] = useState<NotificationDispatchPayload>({ channel: 'email', message: '', recipient: '' });
  const [pushForm, setPushForm] = useState<PushSubscriptionInit>({ endpoint: '', keys: { p256dh: '', auth: '' } });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.message) return;
    onDispatch(form);
  };

  const handlePushSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onSubscribePush) return;
    onSubscribePush(pushForm);
  };

  return (
    <div className="notification-center">
      <section className="notification-center__composer">
        <h2>Send notification</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Channel
            <select
              value={form.channel}
              onChange={(event) => setForm((prev) => ({ ...prev, channel: event.target.value as NotificationChannel }))}
            >
              {channelOptions.map((channel) => (
                <option key={channel} value={channel}>
                  {channel.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <label>
            Recipient
            <input
              value={form.recipient ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, recipient: event.target.value }))}
              placeholder="user@example.com / +1…"
            />
          </label>
          <label className="grid-full">
            Message
            <textarea
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              required
            />
          </label>
          <button className="btn primary" disabled={isDispatching} type="submit">
            {isDispatching ? 'Sending…' : 'Send notification'}
          </button>
        </form>
      </section>

      <section className="notification-center__push">
        <h2>Push subscriptions</h2>
        <p>Placeholder form until device push registration is wired. Backend will persist subscription info.</p>
        {onSubscribePush && (
          <form className="form-grid" onSubmit={handlePushSubmit}>
            <label className="grid-full">
              Endpoint
              <input
                value={pushForm.endpoint}
                onChange={(event) => setPushForm((prev) => ({ ...prev, endpoint: event.target.value }))}
                placeholder="https://push-service.example"
                required
              />
            </label>
            <label>
              p256dh
              <input
                value={pushForm.keys.p256dh}
                onChange={(event) =>
                  setPushForm((prev) => ({ ...prev, keys: { ...prev.keys, p256dh: event.target.value } }))
                }
                required
              />
            </label>
            <label>
              Auth
              <input
                value={pushForm.keys.auth}
                onChange={(event) =>
                  setPushForm((prev) => ({ ...prev, keys: { ...prev.keys, auth: event.target.value } }))
                }
                required
              />
            </label>
            <button className="btn" disabled={isSubscribing} type="submit">
              {isSubscribing ? 'Registering…' : 'Register push placeholder'}
            </button>
          </form>
        )}
      </section>

      <section className="notification-center__feed">
        <h2>Recent notifications</h2>
        <ul>
          {notifications.length === 0 && <li className="empty-state">No notifications yet.</li>}
          {notifications.map((notification) => (
            <li key={notification.id} className={`notification-center__item notification-center__item--${notification.channel}`}>
              <div>
                <strong>{notification.channel.toUpperCase()}</strong>
                <span className="notification-center__timestamp">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
              <p>{notification.message}</p>
              {notification.recipient && <small>Recipient: {notification.recipient}</small>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
