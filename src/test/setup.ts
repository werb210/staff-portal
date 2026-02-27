import "@testing-library/jest-dom";
import { beforeAll, afterAll, afterEach } from "vitest";
import { server } from "./msw/server";

beforeAll(() => {
  (window as Window & { __DISABLE_AUTO_REDIRECT__?: boolean }).__DISABLE_AUTO_REDIRECT__ = true;
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => {
  server.resetHandlers();
  delete (window as Window & { __TEST_AUTH__?: { isAuthenticated?: boolean; role?: string } }).__TEST_AUTH__;
  (window as Window & { __DISABLE_AUTO_REDIRECT__?: boolean }).__DISABLE_AUTO_REDIRECT__ = true;
});
afterAll(() => server.close());

process.env.NODE_ENV = "test";
