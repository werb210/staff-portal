import request from "supertest";
import { describe, test, expect, beforeAll } from "vitest";
import app from "../server/app";

describe("Silo Isolation", () => {
  let bfToken: string;
  let biToken: string;

  beforeAll(() => {
    bfToken = "MOCK_BF_TOKEN";
    biToken = "MOCK_BI_TOKEN";
  });

  test("BF user cannot access BI revenue endpoint", async () => {
    const res = await request(app)
      .get("/api/bi/revenue")
      .set("Authorization", `Bearer ${bfToken}`);

    expect(res.status).toBe(403);
  });

  test("BI user cannot access BF endpoint", async () => {
    const res = await request(app)
      .get("/api/bf/dashboard")
      .set("Authorization", `Bearer ${biToken}`);

    expect(res.status).toBe(403);
  });

  test("Runtime validator blocks cross-silo anomaly response", async () => {
    const res = await request(app)
      .get("/api/test/cross-silo-anomaly")
      .set("Authorization", `Bearer ${bfToken}`);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Security violation detected" });
  });

  test("Cross-silo SELECT returns zero rows", async () => {
    const res = await request(app)
      .get("/api/applications")
      .set("Authorization", `Bearer ${bfToken}`);

    expect(res.status).toBe(200);
    if (res.body.length > 0) {
      const hasForeign = res.body.some(
        (row: { silo?: string }) => row.silo !== "BF"
      );
      expect(hasForeign).toBe(false);
    }
  });
});
