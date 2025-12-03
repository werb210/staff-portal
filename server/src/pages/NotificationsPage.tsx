import { useNotifications } from "../hooks/useNotifications";

export default function NotificationsPage() {
  const { list, markRead, remove } = useNotifications();

  if (list.isLoading) return <div>Loading notifications…</div>;
  if (list.isError) return <div>Error loading notifications</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Notifications</h1>

      {list.data?.length === 0 && <div>No notifications.</div>}

      {list.data?.map((n: any) => (
        <div
          key={n.id}
          style={{
            padding: 12,
            border: "1px solid #ddd",
            marginBottom: 10,
            background: n.read ? "#fafafa" : "#eef6ff",
            borderRadius: 6,
          }}
        >
          <div style={{ fontWeight: "bold" }}>{n.title}</div>
          <div style={{ marginTop: 4 }}>{n.message}</div>

          <div style={{ marginTop: 10 }}>
            {!n.read && (
              <button
                onClick={() => markRead.mutate(n.id)}
                style={{ marginRight: 10 }}
              >
                Mark Read
              </button>
            )}

            <button onClick={() => remove.mutate(n.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
