import "@testing-library/jest-dom/vitest";
import { afterEach, beforeAll, describe, it, test, vi } from "vitest";
import { cleanup } from "@testing-library/react";

const blockSkip = (label: string) => {
  return () => {
    throw new Error(`Skipped tests are not allowed (${label}).`);
  };
};

beforeAll(() => {
  vi.stubEnv("VITE_API_BASE_URL", "http://localhost/api");
  it.skip = blockSkip("it.skip") as typeof it.skip;
  test.skip = blockSkip("test.skip") as typeof test.skip;
  describe.skip = blockSkip("describe.skip") as typeof describe.skip;

  window.addEventListener("unhandledrejection", (event) => {
    throw event.reason instanceof Error
      ? event.reason
      : new Error(`Unhandled promise rejection: ${String(event.reason)}`);
  });

  window.addEventListener("error", (event) => {
    throw event.error instanceof Error
      ? event.error
      : new Error(`Unhandled error: ${event.message}`);
  });
});

afterEach(() => {
  cleanup();
});
