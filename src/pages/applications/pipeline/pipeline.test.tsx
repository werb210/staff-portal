import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient } from "@tanstack/react-query";
import type { MockedFunction } from "vitest";
import PipelinePage from "./PipelinePage";
import { renderWithProviders } from "@/test/testUtils";
import { pipelineApi } from "./pipeline.api";
import { createPipelineDragEndHandler } from "./pipeline.store";
import { PIPELINE_STAGE_LABELS, canMoveCardToStage, type PipelineApplication, type PipelineDragEndEvent } from "./pipeline.types";

vi.mock("./pipeline.api", () => {
  const fetchColumn = vi.fn().mockResolvedValue([]);
  const moveCard = vi.fn().mockResolvedValue({});
  const fetchSummary = vi.fn();
  return { pipelineApi: { fetchColumn, moveCard, fetchSummary } };
});

const sampleCard: PipelineApplication = {
  id: "app-1",
  businessName: "Acme Co",
  contactName: "John Doe",
  requestedAmount: 50000,
  productCategory: "startup",
  stage: "new",
  status: "New",
  documents: { submitted: 1, required: 3 },
  bankingComplete: false,
  ocrComplete: false,
  assignedStaff: "Alex Agent",
  createdAt: new Date().toISOString()
};

const buildDragEvent = (toStage: string): PipelineDragEndEvent => ({
  active: {
    id: sampleCard.id,
    data: { current: { card: sampleCard, stageId: sampleCard.stage } }
  },
  over: { id: toStage }
}) as PipelineDragEndEvent;

describe("Pipeline foundation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (pipelineApi.fetchColumn as MockedFunction<typeof pipelineApi.fetchColumn>).mockResolvedValue([]);
  });

  it("renders all BF pipeline columns", async () => {
    renderWithProviders(<PipelinePage />);

    Object.values(PIPELINE_STAGE_LABELS).forEach((label) => {
      const headers = screen.getAllByText(label, { selector: ".pipeline-column__title" });
      expect(headers.length).toBeGreaterThan(0);
    });

    await waitFor(() => expect(pipelineApi.fetchColumn).toHaveBeenCalled());
  });

  it("blocks pipeline for non-BF silos", () => {
    renderWithProviders(<PipelinePage />, { silo: "BI" });
    expect(screen.getByText(/Pipeline is not available/)).toBeInTheDocument();
  });

  it("applies search filter when updated", async () => {
    renderWithProviders(<PipelinePage />);
    const searchInput = screen.getByLabelText(/Search/i);
    await userEvent.type(searchInput, "Acme");

    await waitFor(() =>
      expect(pipelineApi.fetchColumn).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ searchTerm: "Acme" }),
        expect.any(Object)
      )
    );
  });

  it("prevents movement from terminal stages", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const handler = createPipelineDragEndHandler({ queryClient, filters: {} });
    const terminalEvent = {
      active: { id: sampleCard.id, data: { current: { card: { ...sampleCard, stage: "accepted" }, stageId: "accepted" } } },
      over: { id: "new" }
    } as PipelineDragEndEvent;

    await handler(terminalEvent);
    expect(pipelineApi.moveCard).not.toHaveBeenCalled();
  });

  it("invokes API when dragging to new stage", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const handler = createPipelineDragEndHandler({ queryClient, filters: {} });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    await handler(buildDragEvent("lender"));

    expect(pipelineApi.moveCard).toHaveBeenCalledWith(sampleCard.id, "lender");
    expect(invalidateSpy).toHaveBeenCalled();
  });

  it("avoids refetch storms when dragging applications", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const handler = createPipelineDragEndHandler({ queryClient, filters: {} });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    await handler(buildDragEvent("in_review"));

    expect(invalidateSpy).toHaveBeenCalledTimes(2);
  });

  it("rejects movement into start-up column for non-startup cards", () => {
    const movable = canMoveCardToStage({ ...sampleCard, productCategory: "sba" }, "new", "startup");
    expect(movable).toBe(false);
  });

  it("keeps queries in sync after drag", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const handler = createPipelineDragEndHandler({ queryClient, filters: { searchTerm: "" } });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    await handler(buildDragEvent("in_review"));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["pipeline", "new", "", "", "", "", "", "all", "any", "any", "newest"]
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["pipeline", "in_review", "", "", "", "", "", "all", "any", "any", "newest"]
    });
  });
});
