import { beforeEach, describe, expect, it } from "vitest";
import {
  applyHumanActiveState,
  closeEscalatedChat,
  fetchCommunicationThreads,
  fetchConversationById,
  resetCommunicationsFixtures,
  sendCommunication
} from "@/api/communications";

describe("chat join and close controls", () => {
  beforeEach(() => {
    resetCommunicationsFixtures();
  });

  it("marks session staff active on join and closed on close", async () => {
    const session = (await fetchCommunicationThreads()).find((item) => item.type === "chat");
    expect(session).toBeTruthy();
    if (!session) return;

    const joined = await applyHumanActiveState(session.id);
    expect(joined.status).toBe("human");
    expect(joined.metadata?.aiPaused).toBe(true);

    await sendCommunication(session.id, "Transferred to staff", "system");
    const closed = await closeEscalatedChat(session.id, "in: hello\nout: transferred");
    expect(closed.status).toBe("closed");

    const fetched = await fetchConversationById(session.id);
    expect(fetched.status).toBe("closed");
  });
});
