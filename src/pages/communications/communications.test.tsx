import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";
import CommunicationsPage from "./CommunicationsPage";
import ConversationViewer from "./ConversationViewer";
import MessageComposer from "./MessageComposer";
import { useCommunicationsStore } from "@/state/communications.store";
import {
  deleteIssue,
  ensureCrmLead,
  fetchCrmLeads,
  getApplicationTimelineEntries,
  getCrmTimelineEntries,
  resetCommunicationsFixtures
} from "@/api/communications";

const wrapper = (children: React.ReactNode) => {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

beforeEach(() => {
  resetCommunicationsFixtures();
  useCommunicationsStore.setState({
    conversations: [],
    selectedConversationId: undefined,
    filters: { channel: "all", silo: "all", assigned: "all", search: "" },
    loading: false
  });
});

describe("Communications workflows", () => {
  it("creates a new human escalation conversation", async () => {
    const store = useCommunicationsStore.getState();
    const conversation = await store.escalateToHuman({
      contactId: "contact-x",
      contactName: "Escalated User",
      applicationId: "app-x",
      applicationName: "Escalated App",
      silo: "BF",
      message: "Client requested human assistance via AI chat."
    });

    expect(conversation.type).toBe("human");
    expect(conversation.assignedTo).toBeDefined();
    expect(useCommunicationsStore.getState().conversations[0].id).toBe(conversation.id);
  });

  it("filters conversations by channel and silo", async () => {
    await useCommunicationsStore.getState().loadConversations();
    useCommunicationsStore.getState().setFilters({ channel: "sms" });
    const smsConversations = useCommunicationsStore.getState().filteredConversations();
    expect(smsConversations.every((conv) => conv.type === "sms")).toBe(true);

    useCommunicationsStore.getState().setFilters({ channel: "all", silo: "BF" });
    const bfConversations = useCommunicationsStore.getState().filteredConversations();
    expect(bfConversations.every((conv) => conv.silo === "BF")).toBe(true);
  });

  it("runs issue workflow with acknowledgement", async () => {
    const store = useCommunicationsStore.getState();
    const issue = await store.reportIssue({
      contactId: "contact-issue",
      contactName: "Issue User",
      applicationId: "app-issue",
      applicationName: "Issue App",
      silo: "BI",
      message: "Upload failed"
    });

    expect(issue.type).toBe("issue");
    expect(issue.acknowledged).toBe(false);

    await store.acknowledgeIssue(issue.id);
    const updated = useCommunicationsStore.getState().conversations.find((conv) => conv.id === issue.id);
    expect(updated?.acknowledged).toBe(true);
  });

  it("handles SMS send and receive workflow", async () => {
    const store = useCommunicationsStore.getState();
    await store.loadConversations();
    const smsConversation = useCommunicationsStore.getState().conversations.find((conv) => conv.type === "sms");
    expect(smsConversation).toBeDefined();
    if (!smsConversation) return;

    await store.sendReply(smsConversation.id, "Outbound SMS", "sms");
    await store.receiveSms(smsConversation.id, "Inbound SMS");

    const refreshed = useCommunicationsStore
      .getState()
      .conversations.find((conv) => conv.id === smsConversation.id);
    expect(refreshed?.messages.find((m) => m.message.includes("Outbound SMS"))).toBeDefined();
    expect(refreshed?.messages.find((m) => m.message.includes("Inbound SMS"))).toBeDefined();
  });

  it("links communications to CRM and Application timelines", async () => {
    const store = useCommunicationsStore.getState();
    await store.loadConversations();
    const first = useCommunicationsStore.getState().conversations[0];
    await store.sendReply(first.id, "Timeline linked message");

    const crmEntries = getCrmTimelineEntries(first.contactId as string);
    const appEntries = getApplicationTimelineEntries(first.applicationId as string);
    expect(crmEntries.some((entry) => entry.message.includes("Staff replied"))).toBe(true);
    expect(appEntries.some((entry) => entry.message.includes("Staff replied"))).toBe(true);
  });

  it("auto-scrolls conversation viewer on new messages", async () => {
    await useCommunicationsStore.getState().loadConversations();
    const conversation = useCommunicationsStore.getState().conversations[0];
    const { rerender } = render(
      wrapper(
        <ConversationViewer
          conversation={conversation}
          onSend={async () => {}}
          onAcknowledgeIssue={() => undefined}
        />
      )
    );
    const viewer = screen.getByTestId("conversation-viewer");
    (viewer as HTMLDivElement).scrollTop = 0;

    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, { ...conversation.messages[0], id: "new" }]
    };
    rerender(
      wrapper(
        <ConversationViewer
          conversation={updatedConversation}
          onSend={async () => {}}
          onAcknowledgeIssue={() => undefined}
        />
      )
    );

    expect(viewer.scrollTop).toBe(viewer.scrollHeight);
  });

  it("allows switching between SMS and chat in composer", async () => {
    await useCommunicationsStore.getState().loadConversations();
    const smsConversation = useCommunicationsStore.getState().conversations.find((conv) => conv.type === "sms");
    const handleSend = vi.fn();
    render(wrapper(<MessageComposer conversation={smsConversation} onSend={handleSend} />));
    const selector = screen.getAllByLabelText("Submit via")[0] as HTMLSelectElement;
    expect(selector.value).toBe("sms");
    fireEvent.change(selector, { target: { value: "chat" } });
    expect(selector.value).toBe("chat");
  });


  it("deduplicates CRM leads by email and phone", async () => {
    const first = ensureCrmLead({ name: "Lead One", email: "same@example.com", phone: "+1-555-0000", tags: ["startup_interest"] });
    const second = ensureCrmLead({ name: "Lead Two", email: "same@example.com", phone: "+1-555-0000", tags: ["confidence_check"] });

    expect(first.id).toBe(second.id);
    const leads = await fetchCrmLeads();
    expect(leads).toHaveLength(1);
    expect(leads[0].tags).toEqual(expect.arrayContaining(["startup_interest", "confidence_check"]));
  });

  it("deletes issue records without affecting CRM leads", async () => {
    const store = useCommunicationsStore.getState();
    const issue = await store.reportIssue({
      contactName: "Issue Contact",
      silo: "BF",
      message: "Broken form",
      screenshot: "https://cdn.example.com/issue.png"
    });

    await deleteIssue(issue.id);
    await store.loadConversations();

    const after = await fetchCrmLeads();
    expect(after.some((lead) => lead.id === issue.leadId)).toBe(true);
    expect(useCommunicationsStore.getState().conversations.find((conv) => conv.id === issue.id)).toBeUndefined();
  });
  it("renders communications page with conversation list", async () => {
    render(wrapper(<CommunicationsPage />));
    await waitFor(() => expect(screen.getByTestId("conversation-list")).toBeInTheDocument());
    const conversationButtons = screen.getAllByRole("button", { name: /Silo:/ });
    expect(conversationButtons.length).toBeGreaterThan(0);
  });
});
