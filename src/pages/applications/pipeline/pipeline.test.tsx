import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient } from "@tanstack/react-query";
import type { MockedFunction } from "vitest";
import PipelinePage from "./PipelinePage";
import { renderWithProviders } from "@/test/testUtils";
import { pipelineApi } from "./pipeline.api";
import { createPipelineDragEndHandler, usePipelineStore } from "./pipeline.store";
import { PIPELINE_STAGE_LABELS, type PipelineApplication, type PipelineDragEndEvent } from "./pipeline.types";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";

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
  stage: "received",
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
    usePipelineStore.getState().resetPipeline();
    useApplicationDrawerStore.setState({ selectedTab: "overview" });
    window.localStorage.clear();
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
      active: { id: sampleCard.id, data: { current: { card: { ...sampleCard, stage: "offer" }, stageId: "offer" } } },
      over: { id: "received" }
    } as PipelineDragEndEvent;

    await handler(terminalEvent);
    expect(pipelineApi.moveCard).not.toHaveBeenCalled();
  });

  it("invokes API when dragging to new stage", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const handler = createPipelineDragEndHandler({ queryClient, filters: {} });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    await handler(buildDragEvent("off_to_lender"));

    expect(pipelineApi.moveCard).toHaveBeenCalledWith(sampleCard.id, "off_to_lender");
    expect(invalidateSpy).toHaveBeenCalled();
  });

  it("avoids refetch storms when dragging applications", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const handler = createPipelineDragEndHandler({ queryClient, filters: {} });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    await handler(buildDragEvent("in_review"));

    expect(invalidateSpy).toHaveBeenCalledTimes(4);
  });

  it("keeps queries in sync after drag", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const handler = createPipelineDragEndHandler({ queryClient, filters: { searchTerm: "" } });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    await handler(buildDragEvent("in_review"));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["pipeline", "received", "", "", "", "", "", "all", "any", "any", "newest"]
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["pipeline", "in_review", "", "", "", "", "", "all", "any", "any", "newest"]
    });
  });
});

describe("Pipeline determinism", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (pipelineApi.fetchColumn as MockedFunction<typeof pipelineApi.fetchColumn>).mockResolvedValue([]);
    usePipelineStore.getState().resetPipeline();
    useApplicationDrawerStore.setState({ selectedTab: "overview" });
    window.localStorage.clear();
  });

  it("preserves selection across tab changes", () => {
    const { selectApplication } = usePipelineStore.getState();
    selectApplication("app-1", "received");
    useApplicationDrawerStore.getState().setTab("documents");
    expect(usePipelineStore.getState().selectedApplicationId).toBe("app-1");
  });

  it("preserves selection when stage still contains application", async () => {
    (pipelineApi.fetchColumn as MockedFunction<typeof pipelineApi.fetchColumn>).mockImplementation(async (stage) => {
      if (stage === "received" || stage === "in_review") {
        return [{ ...sampleCard }];
      }
      return [];
    });

    renderWithProviders(<PipelinePage />);
    await waitFor(() => expect(pipelineApi.fetchColumn).toHaveBeenCalled());
    await screen.findByLabelText(new RegExp(`${sampleCard.businessName} in Received`, "i"));
    await screen.findByLabelText(new RegExp(`${sampleCard.businessName} in In Review`, "i"));
    usePipelineStore.getState().selectApplication(sampleCard.id, "received");
    usePipelineStore.getState().setSelectedStageId("in_review");

    await waitFor(() => expect(usePipelineStore.getState().selectedApplicationId).toBe(sampleCard.id));
  });

  it("clears selection when stage no longer contains application", async () => {
    (pipelineApi.fetchColumn as MockedFunction<typeof pipelineApi.fetchColumn>).mockImplementation(async (stage) => {
      if (stage === "received") {
        return [{ ...sampleCard }];
      }
      return [];
    });

    renderWithProviders(<PipelinePage />);
    await waitFor(() => expect(pipelineApi.fetchColumn).toHaveBeenCalled());
    await userEvent.click(await screen.findByText(sampleCard.businessName));
    await userEvent.click(screen.getAllByRole("button", { name: /In Review/i })[0]);

    expect(usePipelineStore.getState().selectedApplicationId).toBeNull();
  });

  it("keeps selection when closing drawer", () => {
    const { selectApplication, closeDrawer } = usePipelineStore.getState();
    selectApplication("app-1", "received");
    closeDrawer();
    expect(usePipelineStore.getState().selectedApplicationId).toBe("app-1");
  });

  it("restores state from storage on reload", async () => {
    window.localStorage.setItem(
      "portal.application.pipeline",
      JSON.stringify({
        selectedStageId: "in_review",
        selectedApplicationId: "app-55",
        filters: { searchTerm: "Atlas" },
        isDrawerOpen: true
      })
    );

    vi.resetModules();
    const { usePipelineStore: reloadedStore } = await import("./pipeline.store");
    expect(reloadedStore.getState().selectedStageId).toBe("in_review");
    expect(reloadedStore.getState().selectedApplicationId).toBe("app-55");
    expect(reloadedStore.getState().currentFilters.searchTerm).toBe("Atlas");
    expect(reloadedStore.getState().isDrawerOpen).toBe(true);
  });
});
