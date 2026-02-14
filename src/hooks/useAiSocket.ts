import { useEffect } from "react";

export function connectToAiSession(sessionId: string, onMessage: (msg: any) => void) {
  const ws = new WebSocket(
    `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/api/ai/ws?sessionId=${sessionId}`
  );

  ws.onmessage = (event) => {
    onMessage(JSON.parse(event.data));
  };

  return () => ws.close();
}

export function useAiSocket(sessionId: string | null, onMessage: (msg: any) => void) {
  useEffect(() => {
    if (!sessionId) return;
    const disconnect = connectToAiSession(sessionId, onMessage);
    return disconnect;
  }, [sessionId, onMessage]);
}
