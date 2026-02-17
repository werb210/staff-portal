import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.stubEnv("VITE_API_BASE_URL", "http://localhost/api");
vi.stubEnv("VITE_JWT_STORAGE_KEY", "portal_auth_token");
