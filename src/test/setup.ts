import "@testing-library/jest-dom/vitest";

(window as any).__ENV__ = {
  VITE_API_URL: "http://localhost/api"
};
