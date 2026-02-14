import { describe, expect, it } from "vitest";
import { canAccessLenderResource } from "@/utils/permissions";

describe("role-based lender resource access", () => {
  it("allows admin across lenders", () => {
    expect(canAccessLenderResource({ role: "Admin", userLenderId: "l-1", resourceLenderId: "l-2" })).toBe(true);
  });

  it("allows lender only for same lender id", () => {
    expect(canAccessLenderResource({ role: "Lender", userLenderId: "l-1", resourceLenderId: "l-1" })).toBe(true);
    expect(canAccessLenderResource({ role: "Lender", userLenderId: "l-1", resourceLenderId: "l-2" })).toBe(false);
  });
});
