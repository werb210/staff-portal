import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../lib/api";
import { subscribe } from "../../../realtime/wsClient";

interface TimelineRow {
  id: string;
  applicationId: string;
  type: string;
  description: string;
  createdAt: string;
}

export default function ApplicationTimelinePage() {
  const { id } = useParams();
  const [rows, setRows] = useState<TimelineRow[]>([]);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await api.get(`/timeline/applications/${id}`);
        setRows(res.data.data ?? []);
      } catch (_) {}
    })();

    subscribe((msg) => {
      if (msg.type === "timeline_event" && msg.payload.applicationId === id) {
        setRows((prev) => [msg.payload, ...prev]);
      }
    });
  }, [id]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Application Timeline</h1>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="bg-white shadow p-4 rounded">
            <div className="text-sm text-gray-500">{row.type}</div>
            <div className="text-gray-900">{row.description}</div>
            <div className="text-xs text-gray-400">{new Date(row.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
