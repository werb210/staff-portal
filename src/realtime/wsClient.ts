let socket: WebSocket | null = null;
const listeners: Array<(msg: any) => void> = [];

export function connectWebSocket(userId: string) {
  if (socket) return socket;

  socket = new WebSocket(`ws://${window.location.host}`);

  socket.onopen = () => {
    socket?.send(JSON.stringify({ type: "auth", userId }));
  };

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      listeners.forEach((cb) => cb(msg));
    } catch (_) {}
  };

  return socket;
}

export function subscribe(callback: (msg: any) => void) {
  listeners.push(callback);
}
