import { describe, expect, it, vi, beforeEach } from "vitest";
import { sendStaffMessage, uploadKnowledgeDocument } from "@/services/aiService";
import apiClient from "@/api/httpClient";

vi.mock("@/api/httpClient", () => ({
  default: {
    post: vi.fn()
  }
}));

describe("aiService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("knowledge upload works", async () => {
    const postMock = vi.mocked(apiClient.post);
    postMock.mockResolvedValueOnce({
      id: "doc-1",
      name: "kb.txt",
      category: "Product",
      isActive: true,
      status: "Processing",
      chunkCount: 0,
      lastIndexedAt: null
    });

    await uploadKnowledgeDocument({
      file: new File(["x"], "kb.txt", { type: "text/plain" }),
      category: "Product",
      isActive: true
    });

    expect(postMock).toHaveBeenCalledWith(
      "/admin/ai/upload",
      expect.any(FormData),
      expect.objectContaining({
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
    );
  });

  it("staff reply posts", async () => {
    const postMock = vi.mocked(apiClient.post);
    postMock.mockResolvedValueOnce({
      id: "msg-1",
      role: "staff",
      senderName: "Agent A",
      content: "On it",
      createdAt: new Date().toISOString()
    });

    await sendStaffMessage("chat-1", { content: "On it", staffName: "Agent A" });

    expect(postMock).toHaveBeenCalledWith("/admin/ai/chats/chat-1/messages", {
      role: "staff",
      senderName: "Agent A",
      content: "On it"
    });
  });
});
