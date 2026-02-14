import { useEffect } from "react";

export function useAiSocket(sessionId: string | null, onMessage: (msg: any) => void) {
  useEffect(() => {
    if (!sessionId) return;

    const ws = new WebSocket(
      `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/api/ai/ws?sessionId=${sessionId}`
    );

    ws.onmessage = (event) => {
      onMessage(JSON.parse(event.data));
    };

    return () => ws.close();
  }, [sessionId, onMessage]);
}
