import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/testUtils";
import { useTasksStore } from "@/state/tasks.store";

const now = new Date();
const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

vi.mock("@/api/calendar", () => ({
  fetchLocalEvents: vi.fn().mockResolvedValue([
    { id: "1", title: "Local Event", start: now.toISOString(), end: oneHourLater.toISOString() }
  ]),
  createLocalEvent: vi.fn().mockResolvedValue({
    id: "2",
    title: "Created Event",
    start: "2024-01-01T14:00",
    end: "2024-01-01T15:00"
  })
}));

const mockedCalendar = await import("@/api/calendar");

vi.mock("@/api/tasks", () => ({
  fetchTasks: vi.fn().mockResolvedValue([
    {
      id: "t1",
      title: "My Task",
      priority: "high",
      status: "todo",
      assignedToUserId: "1",
      createdByUserId: "1",
      dueDate: "2024-01-01",
      relatedContactId: "c1"
    },
    {
      id: "t2",
      title: "Assigned Task",
      priority: "medium",
      status: "todo",
      assignedToUserId: "2",
      createdByUserId: "1",
      relatedApplicationId: "app1"
    }
  ]),
  createTask: vi.fn().mockResolvedValue({ id: "t3" }),
  updateTask: vi.fn().mockResolvedValue({ id: "t1" })
}));

const mockedTasks = await import("@/api/tasks");

const { default: CalendarPage } = await import("../CalendarPage");

describe("CalendarPage", () => {
  beforeEach(() => {
    useTasksStore.setState({
      selectedTask: undefined,
      filters: { mine: false, createdByMe: false, overdue: false, silo: undefined },
      setSelectedTask: useTasksStore.getState().setSelectedTask,
      setFilters: useTasksStore.getState().setFilters,
      toggleCompletion: useTasksStore.getState().toggleCompletion,
      setSilo: useTasksStore.getState().setSilo
    });
  });

  it("renders day/week/month views", async () => {
    renderWithProviders(<CalendarPage />);
    await screen.findByRole("button", { name: /Month/ });

    fireEvent.click(screen.getByRole("button", { name: /Day/ }));
    await waitFor(() => expect(document.querySelector(".calendar-view--day")).not.toBeNull());

    fireEvent.click(screen.getByRole("button", { name: /Week/ }));
    await waitFor(() => expect(document.querySelector(".calendar-view--week")).not.toBeNull());

    fireEvent.click(screen.getByRole("button", { name: /Month/ }));
    await waitFor(() => expect(document.querySelector(".calendar-view--month")).not.toBeNull());
  });

  it("allows creating local events", async () => {
    renderWithProviders(<CalendarPage />);
    fireEvent.click(screen.getByRole("button", { name: /Add Event/ }));
    const form = screen.getByTestId("event-form");
    fireEvent.change(within(form).getByPlaceholderText(/Title/), { target: { value: "Check-in" } });
    const dateInputs = within(form)
      .getAllByDisplayValue("")
      .filter((input) => (input as HTMLInputElement).type === "datetime-local") as HTMLInputElement[];
    fireEvent.change(dateInputs[0], { target: { value: "2024-01-02T09:00" } });
    fireEvent.change(dateInputs[1], { target: { value: "2024-01-02T10:00" } });
    fireEvent.click(screen.getByText(/Save Event/));

    await waitFor(() => expect(mockedCalendar.createLocalEvent).toHaveBeenCalled());
  });

  it("renders task pane with filters and completion", async () => {
    renderWithProviders(<CalendarPage />);
    expect(await screen.findByText(/My Task/)).toBeInTheDocument();
    expect(screen.getByText(/Assigned Task/)).toBeInTheDocument();
  });

  it("supports linking tasks to contacts and applications", async () => {
    renderWithProviders(<CalendarPage />);
    await waitFor(() => expect(screen.queryAllByTestId("task-contact").length).toBeGreaterThan(0));
    expect(screen.queryAllByTestId("task-application").length).toBeGreaterThan(0);
  });
});
