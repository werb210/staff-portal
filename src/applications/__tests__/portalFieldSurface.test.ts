import { existsSync } from "node:fs";
import path from "node:path";
import { PORTAL_FIELD_SURFACE } from "../__generated__/portalFieldSurface";

type FieldEntry = { key: string; file: string };

describe("PORTAL_FIELD_SURFACE", () => {
  const sections = {
    pipeline_card: PORTAL_FIELD_SURFACE.pipeline_card,
    drawer_header: PORTAL_FIELD_SURFACE.drawer_header,
    drawer_application: PORTAL_FIELD_SURFACE.drawer.application,
    drawer_banking: PORTAL_FIELD_SURFACE.drawer.banking,
    drawer_financials: PORTAL_FIELD_SURFACE.drawer.financials,
    drawer_documents: PORTAL_FIELD_SURFACE.drawer.documents,
    drawer_credit_summary: PORTAL_FIELD_SURFACE.drawer.credit_summary,
    drawer_notes: PORTAL_FIELD_SURFACE.drawer.notes,
    drawer_lenders: PORTAL_FIELD_SURFACE.drawer.lenders,
    drawer_offers: PORTAL_FIELD_SURFACE.drawer.offers
  };

  it("exposes all top-level sections", () => {
    expect(PORTAL_FIELD_SURFACE.pipeline_card).toBeDefined();
    expect(PORTAL_FIELD_SURFACE.drawer_header).toBeDefined();
    expect(PORTAL_FIELD_SURFACE.drawer).toBeDefined();
    expect(PORTAL_FIELD_SURFACE.drawer.application).toBeDefined();
    expect(PORTAL_FIELD_SURFACE.drawer.banking).toBeDefined();
    expect(PORTAL_FIELD_SURFACE.drawer.financials).toBeDefined();
    expect(PORTAL_FIELD_SURFACE.drawer.documents).toBeDefined();
    expect(PORTAL_FIELD_SURFACE.drawer.credit_summary).toBeDefined();
    expect(PORTAL_FIELD_SURFACE.drawer.notes).toBeDefined();
    expect(PORTAL_FIELD_SURFACE.drawer.lenders).toBeDefined();
    expect(PORTAL_FIELD_SURFACE.drawer.offers).toBeDefined();
  });

  it("contains at least one field per section", () => {
    for (const [name, entries] of Object.entries(sections)) {
      expect(entries.length).toBeGreaterThan(0);
      expect(entries, `${name} should be an array`).toBeInstanceOf(Array);
    }
  });

  it("has no duplicate keys per section", () => {
    for (const [name, entries] of Object.entries(sections)) {
      const keys = entries.map((entry) => entry.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size, `${name} contains duplicate keys`).toBe(keys.length);
    }
  });

  it("references existing files", () => {
    const repoRoot = path.resolve(__dirname, "../../..");
    const allEntries: FieldEntry[] = Object.values(sections).flat();
    for (const entry of allEntries) {
      const resolved = path.join(repoRoot, entry.file);
      expect(existsSync(resolved), `${entry.file} should exist`).toBe(true);
    }
  });
});
