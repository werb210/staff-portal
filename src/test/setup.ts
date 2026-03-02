import { beforeAll, afterEach, afterAll, vi } from "vitest";
import { server } from "./msw/server";

// Prevent real network calls
beforeAll(() => {
  server.listen({
    onUnhandledRequest: "error",
  });
});

// Reset handlers between tests
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

// Cleanup
afterAll(() => {
  server.close();
});
