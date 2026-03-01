import { useEffect, useState } from "react";
import { fetchCallHistory, type CallSession } from "../services/callService";

export default function CallHistoryTab({ clientId }: { clientId: string }) {
  const [calls, setCalls] = useState<CallSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCallHistory(clientId)
      .then(setCalls)
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) return <div>Loading call history...</div>;

  if (!calls.length) return <div>No calls yet.</div>;

  return (
    <div className="space-y-4">
      {calls.map((call) => (
        <div key={call.id} className="border rounded p-4">
          <div className="flex justify-between">
            <span className="font-semibold">{call.status}</span>
            <span>{new Date(call.started_at).toLocaleString()}</span>
          </div>

          {call.recording_url && (
            <div className="mt-2">
              <audio controls src={call.recording_url} />
              {call.recording_duration && (
                <div className="text-sm text-gray-500">Duration: {call.recording_duration}s</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
