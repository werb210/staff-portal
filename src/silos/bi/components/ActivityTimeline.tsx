import { useEffect, useState } from "react";
import { biFetch } from "../../../api/biClient";

type ActivityEvent = {
  id: string;
  event_type: string;
  summary: string;
  created_at: string;
};

export default function ActivityTimeline({
  applicationId
}: {
  applicationId: string;
}) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const data = await biFetch(`/applications/${applicationId}/activity`);
    setEvents([...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  }

  return (
    <div>
      <h3>Activity Timeline</h3>
      {events.map((e) => (
        <div key={e.id} style={{ marginBottom: "10px" }}>
          <strong>{e.event_type}</strong>
          <p>{e.summary}</p>
          <small>{new Date(e.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
