import "@testing-library/jest-dom";
import { beforeAll, afterAll, afterEach } from "vitest";
import { server } from "./msw/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  delete (window as Window & { __TEST_AUTH__?: { isAuthenticated?: boolean; role?: string } }).__TEST_AUTH__;
});
afterAll(() => server.close());

process.env.NODE_ENV = "test";
