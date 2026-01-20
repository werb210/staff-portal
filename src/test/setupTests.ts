import "@testing-library/jest-dom/vitest";
import { afterEach, beforeAll, describe, it, test, vi } from "vitest";
import { cleanup } from "@testing-library/react";

vi.stubEnv("VITE_API_BASE_URL", "http://localhost/api");

const blockSkip = (label: string) => {
  return () => {
    throw new Error(`Skipped tests are not allowed (${label}).`);
  };
};

const overrideSkip = (target: { skip?: unknown }, label: string) => {
  const descriptor = Object.getOwnPropertyDescriptor(target, "skip");
  const replacement = blockSkip(label);
  if (!descriptor || descriptor.writable) {
    target.skip = replacement;
    return;
  }
  if (descriptor.configurable) {
    Object.defineProperty(target, "skip", {
      value: replacement,
      configurable: true
    });
  }
};

beforeAll(() => {
  overrideSkip(it, "it.skip");
  overrideSkip(test, "test.skip");
  overrideSkip(describe, "describe.skip");

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
