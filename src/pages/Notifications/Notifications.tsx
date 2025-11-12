import { useNotifications } from '../../hooks/api/useNotifications';

export default function Notifications() {
  const { data: notifications, isLoading } = useNotifications();
  if (isLoading) return <p>Loading notifications...</p>;

  return (
    <div>
      <h1>Notifications</h1>
      <ul>
        {notifications?.map((n: any) => (
          <li key={n.id}>{n.message}</li>
        ))}
      </ul>
    </div>
  );
}
