let socket: WebSocket | null = null;
let listeners: ((msg: any) => void)[] = [];

export function startSocket(userId: string) {
  if (socket) socket.close();

  socket = new WebSocket(
    `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}?userId=${userId}`
  );

  socket.onmessage = (evt) => {
    try {
      const data = JSON.parse(evt.data);
      for (const fn of listeners) fn(data);
    } catch (_) {}
  };

  socket.onclose = () => {
    // Auto-reconnect
    setTimeout(() => startSocket(userId), 2000);
  };
}

export function onSocketMessage(handler: (msg: any) => void) {
  listeners.push(handler);
  return () => {
    listeners = listeners.filter((x) => x !== handler);
  };
}
