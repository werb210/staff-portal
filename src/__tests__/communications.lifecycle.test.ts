import { beforeEach, describe, expect, it } from "vitest";
import {
  applyHumanActiveState,
  archiveIssue,
  attachTranscriptToLead,
  closeEscalatedChat,
  createHumanEscalation,
  createIssueReport,
  deleteIssue,
  ensureCrmLead,
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


  it("captures readiness profile fields and links lead to conversation", async () => {
    const readinessConversation = (await fetchCommunicationThreads()).find((item) => item.type === "credit_readiness");
    expect(readinessConversation).toBeTruthy();

    if (!readinessConversation) return;
    const leads = await fetchCrmLeads();
    const readinessLead = leads.find((lead) => lead.id === readinessConversation.leadId);
    expect(readinessLead).toBeTruthy();
    expect(readinessLead?.company).toBe("Readiness Session");
    expect(readinessLead?.fullName).toBe("Nora Readiness");
    expect(readinessLead?.email).toBe("nora@ventures.example");
    expect(readinessLead?.phone).toBe("+1-555-0404");
    expect(readinessLead?.industry).toBe("Technology");
    expect(readinessLead?.yib).toBe("2");
    expect(readinessLead?.revenue).toBe("$85,000/mo");
    expect(readinessLead?.ar).toBe("$18,000");
    expect(readinessLead?.existingDebt).toBe("$12,000");
    expect(readinessLead?.conversationIds).toContain(readinessConversation.id);
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

  it("archives issues and marks escalated sessions as AI paused when human becomes active", async () => {
    const issue = await createIssueReport({
      silo: "BF",
      message: "Client issue",
      screenshot: "/secure/issues/img-archive.png",
      context: "website"
    });
    const archived = await archiveIssue(issue.id);
    expect(archived.metadata?.archived).toBe(true);

    const escalation = await createHumanEscalation({
      silo: "BF",
      contactName: "Portal User",
      message: "Need staff now"
    });
    const paused = await applyHumanActiveState(escalation.id);
    expect(paused.metadata?.aiPaused).toBe(true);
    expect(paused.status).toBe("human");
  });

  it("deletes only resolved issue records and leaves CRM lead data intact", async () => {
    const issue = await createIssueReport({
      silo: "BF",
      message: "Client cannot upload file",
      context: "client"
    });
    const leadId = issue.leadId;
    expect(leadId).toBeTruthy();

    await expect(deleteIssue(issue.id)).rejects.toThrow("Issue must be resolved before deletion");
    await closeEscalatedChat(issue.id, "Issue resolved by staff.");
    await deleteIssue(issue.id);

    const threads = await fetchCommunicationThreads();
    expect(threads.some((item) => item.id === issue.id)).toBe(false);

    const crmLeads = await fetchCrmLeads();
    expect(crmLeads.some((lead) => lead.id === leadId)).toBe(true);
  });

  it("deduplicates CRM leads by email and phone", async () => {
    const first = ensureCrmLead({
      name: "Lead One",
      email: "same@example.com",
      phone: "+1-555-5000",
      tags: ["readiness"]
    });

    const second = ensureCrmLead({
      name: "Lead Two",
      email: "same@example.com",
      phone: "+1-555-5000",
      tags: ["chat_start"]
    });

    expect(first.id).toBe(second.id);

    const byPhone = ensureCrmLead({
      name: "Lead Three",
      phone: "+1-555-5000"
    });

    expect(byPhone.id).toBe(first.id);
    expect(byPhone.tags).toEqual(expect.arrayContaining(["readiness", "chat_start"]));
  });

});
