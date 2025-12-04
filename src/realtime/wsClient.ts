let socket: WebSocket | null = null;
const listeners: Array<(msg: any) => void> = [];

function send(msg: any) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msg));
  }
}

export function connectWebSocket(userId: string) {
  if (socket) return socket;

  socket = new WebSocket(`ws://${window.location.host}`);

  socket.onopen = () => {
    send({ type: "auth", userId });
    identifyUser(userId);
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

export function subscribeTyping(handler) {
  listeners.push((msg) => {
    if (msg.type === "typing") handler(msg.payload);
  });
}

export function subscribePresence(handler) {
  listeners.push((msg) => {
    if (msg.type === "presence_update") handler(msg.payload);
  });
}

export function identifyUser(userId: string) {
  send({ type: "identify", payload: { userId } });
}

export function sendTyping(toUserId: string, isTyping: boolean) {
  send({
    type: "typing",
    payload: { toUserId, isTyping },
  });
}
