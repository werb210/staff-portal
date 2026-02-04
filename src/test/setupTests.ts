import "@testing-library/jest-dom/vitest";
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeAll, describe, it, test, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import api from "@/lib/api";
import clientApi from "@/api/client";

vi.stubEnv("VITE_API_BASE_URL", "http://localhost/api");
api.defaults.baseURL = "http://localhost/api";
clientApi.defaults.baseURL = "http://localhost/api";


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

const fetchAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  const baseURL = config.baseURL ?? "";
  const url = config.url ?? "";
  const response = await fetch(`${baseURL}${url}`, {
    method: config.method?.toUpperCase() ?? "GET",
    headers: config.headers as HeadersInit,
    body: config.data ?? undefined
  });
  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();
  const axiosResponse: AxiosResponse = {
    data,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    config,
    request: {}
  };
  return axiosResponse;
};

api.defaults.adapter = fetchAdapter;
clientApi.defaults.adapter = fetchAdapter;
