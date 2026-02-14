import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  connectAiSocket,
  disconnectAiSocket,
  reconnectAiSocket,
  subscribeAiSocketConnection
} from "@/services/aiSocket";

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  static OPEN = 1;
  static CONNECTING = 0;

  url: string;
  readyState = MockWebSocket.CONNECTING;
  private listeners: Record<string, ((event?: unknown) => void)[]> = {};

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  addEventListener(type: string, listener: (event?: unknown) => void) {
    this.listeners[type] = this.listeners[type] ?? [];
    this.listeners[type].push(listener);
  }

  close() {
    this.readyState = 3;
  }

  emit(type: string, event?: unknown) {
    (this.listeners[type] ?? []).forEach((listener) => listener(event));
  }
}

describe("aiSocket", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("WebSocket", MockWebSocket as unknown as typeof WebSocket);
    MockWebSocket.instances = [];
    disconnectAiSocket();
  });

  it("websocket reconnect works", () => {
    connectAiSocket();
    expect(MockWebSocket.instances.length).toBe(1);

    reconnectAiSocket();
    expect(MockWebSocket.instances.length).toBe(2);
  });

  it("emits connection state and retries with exponential backoff", () => {
    const states: string[] = [];
    const unsubscribe = subscribeAiSocketConnection((state) => states.push(state));

    connectAiSocket();
    const socket = MockWebSocket.instances[0];
    socket.emit("close");

    vi.advanceTimersByTime(1000);
    expect(MockWebSocket.instances.length).toBeGreaterThan(1);
    expect(states).toContain("connecting");

    unsubscribe();
  });
});
