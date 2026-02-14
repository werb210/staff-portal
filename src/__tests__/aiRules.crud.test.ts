import { describe, expect, it } from "vitest";
import {
  createAdminAiRule,
  fetchAdminAiRules,
  updateAdminAiRule
} from "@/api/adminAiRules";

describe("admin ai rules CRUD", () => {
  it("creates and updates AI rules with priority and active flags", async () => {
    const initial = await fetchAdminAiRules();
    const created = await createAdminAiRule({
      name: "Escalate legal requests",
      content: "Always transfer legal requests to staff.",
      active: true,
      priority: 3
    });

    expect(created.id).toBeTruthy();

    const updated = await updateAdminAiRule(created.id, {
      active: false,
      priority: 9
    });

    expect(updated.active).toBe(false);
    expect(updated.priority).toBe(9);

    const rules = await fetchAdminAiRules();
    expect(rules.length).toBeGreaterThanOrEqual(initial.length + 1);
  });
});
