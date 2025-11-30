import React, { useEffect } from 'react';
import { useCommunicationsStore } from '../state/communicationsStore';
import ThreadList from '../components/communications/ThreadList';

export default function CommunicationsPage() {
  const { load, setFilter, filter } = useCommunicationsStore();

  useEffect(() => {
    load();

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (data.type === "message") {
          load();
        }
      } catch (_) {}
    };

    return () => ws.close();
  }, [load]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Communications</h1>

      <div style={{ marginBottom: "20px" }}>
        <button
          className={filter === "ALL" ? "active" : ""}
          onClick={() => setFilter("ALL")}
        >
          All
        </button>
        <button
          className={filter === "UNREAD" ? "active" : ""}
          onClick={() => setFilter("UNREAD")}
        >
          Unread
        </button>
        <button
          className={filter === "ACTIVE" ? "active" : ""}
          onClick={() => setFilter("ACTIVE")}
        >
          Active Threads
        </button>
      </div>

      <ThreadList />
    </div>
  );
}
