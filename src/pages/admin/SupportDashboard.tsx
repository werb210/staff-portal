import { useEffect, useState } from "react";
import { SupportService } from "@/services/supportService";

export default function SupportDashboard() {
  const [issues, setIssues] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const issueRes = await SupportService.listIssues();
      const chatRes = await SupportService.listEscalations();
      setIssues(issueRes.data || []);
      setChats(chatRes.data || []);
    }

    void load();
  }, []);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Support Center</h1>

      <div>
        <h2 className="font-semibold mb-2">Chat Escalations</h2>
        {chats.map((c) => (
          <div key={c.id} className="border p-3 mb-2">
            <div className="text-sm">{c.source}</div>
            <div className="text-xs text-gray-500">{c.created_at}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-semibold mb-2">Issue Reports</h2>
        {issues.map((i) => (
          <div key={i.id} className="border p-3 mb-2">
            <div>{i.description}</div>
            {i.screenshotBase64 && (
              <img
                src={`data:image/png;base64,${i.screenshotBase64}`}
                className="mt-2 max-h-48 border"
                alt="Issue screenshot preview"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
