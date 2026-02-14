import { useEffect, useState } from "react";
import axios from "axios";

type Conversation = {
  id: string;
  created_at: string;
  user_name?: string;
};

export default function AiConversations() {
  const [convos, setConvos] = useState<Conversation[]>([]);

  useEffect(() => {
    axios.get("/api/ai/conversations").then((res) => {
      setConvos(res.data);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-semibold">AI Conversations</h1>

      <div className="space-y-3">
        {convos.map((c) => (
          <div key={c.id} className="rounded border p-3">
            <div>ID: {c.id}</div>
            <div>Date: {new Date(c.created_at).toLocaleString()}</div>
            <div>User: {c.user_name || "Unknown"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
