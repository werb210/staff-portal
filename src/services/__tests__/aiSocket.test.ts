import { beforeEach, describe, expect, it, vi } from "vitest";
import { connectAiSocket, disconnectAiSocket, reconnectAiSocket } from "@/services/aiSocket";

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
}

describe("aiSocket", () => {
  beforeEach(() => {
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
});
