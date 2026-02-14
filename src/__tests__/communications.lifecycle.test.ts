import { beforeEach, describe, expect, it } from "vitest";
import {
  attachTranscriptToLead,
  closeEscalatedChat,
  createHumanEscalation,
  createIssueReport,
  fetchCommunicationThreads,
  fetchCrmLeads,
  resetCommunicationsFixtures
} from "@/api/communications";

describe("chat session lifecycle", () => {
  beforeEach(() => {
    resetCommunicationsFixtures();
  });

  it("creates escalations, closes them, and persists transcript on lead", async () => {
    const escalation = await createHumanEscalation({
      silo: "BF",
      contactName: "Portal User",
      message: "Need help from human"
    });

    const closed = await closeEscalatedChat(escalation.id, "user: help\nstaff: on it");
    expect(closed.status).toBe("closed");

    const leads = await fetchCrmLeads();
    const linked = leads.find((lead) => lead.id === closed.leadId);
    expect(linked?.transcriptIds.length).toBeGreaterThan(0);
  });

  it("does not create duplicate readiness leads and preserves readiness tags", async () => {
    const readinessConversation = (await fetchCommunicationThreads()).find((item) => item.type === "credit_readiness");
    expect(readinessConversation).toBeTruthy();

    if (!readinessConversation) return;
    await attachTranscriptToLead(readinessConversation.id, "readiness transcript");

    const leads = await fetchCrmLeads();
    const readinessLeads = leads.filter((lead) => lead.tags.includes("readiness"));
    expect(readinessLeads.length).toBe(1);
    expect(readinessLeads[0].tags).toEqual(expect.arrayContaining(["readiness", "startup_interest"]));
  });

  it("stores issue report metadata for context and screenshot", async () => {
    const issue = await createIssueReport({
      silo: "BF",
      message: "Button not responding",
      screenshot: "/secure/issues/img-1.png",
      context: "client"
    });

    expect(issue.metadata?.context).toBe("client");
    expect(issue.metadata?.screenshot).toBe("/secure/issues/img-1.png");
    expect(issue.metadata?.timestamp).toBeTypeOf("string");
  });
});
