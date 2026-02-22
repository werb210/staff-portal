import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MockedFunction } from "vitest";
import NotesTab from "@/pages/applications/drawer/tab-notes/NotesTab";
import { renderWithProviders } from "@/test/testUtils";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { fetchNotesThread, sendNoteMessage, updateNoteMessage } from "@/api/notes";

vi.mock("@/api/notes", () => ({
  fetchNotesThread: vi.fn(),
  sendNoteMessage: vi.fn(),
  updateNoteMessage: vi.fn()
}));

describe("NotesTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useApplicationDrawerStore.setState({ selectedApplicationId: "app-1", selectedTab: "notes", isOpen: true });
  });

  it("renders notes in chronological order with mentions, and supports add/edit", async () => {
    (fetchNotesThread as MockedFunction<typeof fetchNotesThread>).mockResolvedValue([
      {
        id: "note-2",
        author: "Jamie",
        body: "Follow up with @sam",
        createdAt: "2024-02-02T12:00:00.000Z"
      },
      {
        id: "note-1",
        author: "Alex",
        body: "Initial review complete",
        createdAt: "2024-02-01T12:00:00.000Z"
      }
    ]);
    (sendNoteMessage as MockedFunction<typeof sendNoteMessage>).mockResolvedValue({});
    (updateNoteMessage as MockedFunction<typeof updateNoteMessage>).mockResolvedValue({});

    renderWithProviders(<NotesTab />, { auth: { user: { id: "1", email: "staff@test.com", role: "Staff" } } });

    const messages = await screen.findAllByText(/review complete|follow up/i);
    expect(messages[0]).toHaveTextContent("Initial review complete");
    const mention = screen.getByText("@sam");
    expect(mention).toHaveClass("note-mention");

    const textarea = screen.getByPlaceholderText("Add a note");
    await userEvent.type(textarea, "New update");
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(sendNoteMessage).toHaveBeenCalledWith("app-1", "New update", "BF");

    const note = screen.getByText("Initial review complete").closest(".note-message");
    expect(note).not.toBeNull();
    const editButton = within(note as HTMLElement).getByRole("button", { name: "Edit" });
    await userEvent.click(editButton);
    const editArea = within(note as HTMLElement).getByRole("textbox");
    await userEvent.clear(editArea);
    await userEvent.type(editArea, "Updated note");
    await userEvent.click(within(note as HTMLElement).getByRole("button", { name: "Save" }));

    expect(updateNoteMessage).toHaveBeenCalledWith("app-1", "note-1", "Updated note", "BF");
  });

  it("enforces read-only access for viewer roles", async () => {
    (fetchNotesThread as MockedFunction<typeof fetchNotesThread>).mockResolvedValue([]);

    renderWithProviders(<NotesTab />, { auth: { user: { id: "2", email: "viewer@test.com", role: "Viewer" } } });

    expect(await screen.findByText(/Notes are read-only/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Submit" })).not.toBeInTheDocument();
  });
});
