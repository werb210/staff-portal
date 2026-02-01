import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient } from "@tanstack/react-query";
import type { MockedFunction } from "vitest";
import PipelinePage from "./PipelinePage";
import { renderWithProviders } from "@/test/testUtils";
import { pipelineApi } from "./pipeline.api";
import { createPipelineDragEndHandler, usePipelineStore } from "./pipeline.store";
import { type PipelineApplication, type PipelineDragEndEvent, type PipelineStage } from "./pipeline.types";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";

vi.mock("./pipeline.api", () => {
  const fetchColumn = vi.fn().mockResolvedValue([]);
  const fetchStages = vi.fn().mockResolvedValue([]);
  const moveCard = vi.fn().mockResolvedValue({});
  const fetchSummary = vi.fn();
  return { pipelineApi: { fetchColumn, fetchStages, moveCard, fetchSummary } };
});

const pipelineStages: PipelineStage[] = [
  { id: "RECEIVED", label: "Received" },
  { id: "DOCUMENTS_REQUIRED", label: "Documents Required" },
  { id: "IN_REVIEW", label: "In Review" },
  { id: "START_UP", label: "Start Up" },
  { id: "OFF_TO_LENDER", label: "Off to Lender" },
  { id: "ACCEPTED", label: "Accepted", terminal: true },
  { id: "DECLINED", label: "Declined", terminal: true }
];

const sampleCard: PipelineApplication = {
  id: "app-1",
  businessName: "Acme Co",
  contactName: "John Doe",
  requestedAmount: 50000,
  productCategory: "startup",
  stage: "RECEIVED",
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
    (pipelineApi.fetchStages as MockedFunction<typeof pipelineApi.fetchStages>).mockResolvedValue(pipelineStages);
    usePipelineStore.getState().resetPipeline();
    useApplicationDrawerStore.setState({ selectedTab: "overview" });
    window.localStorage.clear();
  });

  it("renders all BF pipeline columns", async () => {
    renderWithProviders(<PipelinePage />);

    await waitFor(() => {
      pipelineStages.forEach((stage) => {
        const headers = screen.getAllByText(stage.label, { selector: ".pipeline-column__title" });
        expect(headers.length).toBeGreaterThan(0);
      });
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

  it("resets filters without breaking the pipeline view", async () => {
    renderWithProviders(<PipelinePage />);
    const searchInput = screen.getByLabelText(/Search/i);
    await userEvent.type(searchInput, "Atlas");

    await userEvent.click(screen.getByRole("button", { name: /Reset Filters/i }));

    await waitFor(() => {
      expect(searchInput).toHaveValue("");
    });
  });

  it("prevents movement from terminal stages", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const handler = createPipelineDragEndHandler({ queryClient, filters: {}, stages: pipelineStages });
    const terminalEvent = {
      active: { id: sampleCard.id, data: { current: { card: { ...sampleCard, stage: "ACCEPTED" }, stageId: "ACCEPTED" } } },
      over: { id: "RECEIVED" }
    } as PipelineDragEndEvent;

    await handler(terminalEvent);
    expect(pipelineApi.moveCard).not.toHaveBeenCalled();
  });

  it("invokes API when dragging to new stage", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const handler = createPipelineDragEndHandler({ queryClient, filters: {}, stages: pipelineStages });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    await handler(buildDragEvent("DOCUMENTS_REQUIRED"));

    expect(pipelineApi.moveCard).toHaveBeenCalledWith(sampleCard.id, "DOCUMENTS_REQUIRED");
    expect(invalidateSpy).toHaveBeenCalled();
  });

  it("avoids refetch storms when dragging applications", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const handler = createPipelineDragEndHandler({ queryClient, filters: {}, stages: pipelineStages });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    await handler(buildDragEvent("DOCUMENTS_REQUIRED"));

    expect(invalidateSpy).toHaveBeenCalledTimes(4);
  });

  it("keeps queries in sync after drag", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const handler = createPipelineDragEndHandler({ queryClient, filters: { searchTerm: "" }, stages: pipelineStages });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    await handler(buildDragEvent("DOCUMENTS_REQUIRED"));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["pipeline", "RECEIVED", "", "", "", "", "newest"]
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["pipeline", "DOCUMENTS_REQUIRED", "", "", "", "", "newest"]
    });
  });
});

describe("Pipeline determinism", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (pipelineApi.fetchColumn as MockedFunction<typeof pipelineApi.fetchColumn>).mockResolvedValue([]);
    (pipelineApi.fetchStages as MockedFunction<typeof pipelineApi.fetchStages>).mockResolvedValue(pipelineStages);
    usePipelineStore.getState().resetPipeline();
    useApplicationDrawerStore.setState({ selectedTab: "overview" });
    window.localStorage.clear();
  });

  it("preserves selection across tab changes", () => {
    const { selectApplication } = usePipelineStore.getState();
    selectApplication("app-1", "RECEIVED");
    useApplicationDrawerStore.getState().setTab("documents");
    expect(usePipelineStore.getState().selectedApplicationId).toBe("app-1");
  });

  it("preserves selection when stage still contains application", async () => {
    (pipelineApi.fetchColumn as MockedFunction<typeof pipelineApi.fetchColumn>).mockImplementation(async (stage) => {
      if (stage === "RECEIVED" || stage === "DOCUMENTS_REQUIRED") {
        return [{ ...sampleCard }];
      }
      return [];
    });

    renderWithProviders(<PipelinePage />);
    await waitFor(() => expect(pipelineApi.fetchColumn).toHaveBeenCalled());
    await screen.findByLabelText(new RegExp(`${sampleCard.businessName} in Received`, "i"));
    await screen.findByLabelText(new RegExp(`${sampleCard.businessName} in Documents Required`, "i"));
    usePipelineStore.getState().selectApplication(sampleCard.id, "RECEIVED");
    usePipelineStore.getState().setSelectedStageId("DOCUMENTS_REQUIRED");

    await waitFor(() => expect(usePipelineStore.getState().selectedApplicationId).toBe(sampleCard.id));
  });

  it("clears selection when stage no longer contains application", async () => {
    (pipelineApi.fetchColumn as MockedFunction<typeof pipelineApi.fetchColumn>).mockImplementation(async (stage) => {
      if (stage === "RECEIVED") {
        return [{ ...sampleCard }];
      }
      return [];
    });

    renderWithProviders(<PipelinePage />);
    await waitFor(() => expect(pipelineApi.fetchColumn).toHaveBeenCalled());
    await userEvent.click(await screen.findByText(sampleCard.businessName));
    await userEvent.click(screen.getAllByRole("button", { name: /Documents Required/i })[0]);

    expect(usePipelineStore.getState().selectedApplicationId).toBeNull();
  });

  it("keeps selection when closing drawer", () => {
    const { selectApplication, closeDrawer } = usePipelineStore.getState();
    selectApplication("app-1", "RECEIVED");
    closeDrawer();
    expect(usePipelineStore.getState().selectedApplicationId).toBe("app-1");
  });

  it("restores state from storage on reload", async () => {
    window.localStorage.setItem(
      "portal.application.pipeline",
      JSON.stringify({
        selectedStageId: "DOCUMENTS_REQUIRED",
        selectedApplicationId: "app-55",
        filters: { searchTerm: "Atlas" },
        isDrawerOpen: true
      })
    );

    vi.resetModules();
    const { usePipelineStore: reloadedStore } = await import("./pipeline.store");
    expect(reloadedStore.getState().selectedStageId).toBe("DOCUMENTS_REQUIRED");
    expect(reloadedStore.getState().selectedApplicationId).toBe("app-55");
    expect(reloadedStore.getState().currentFilters.searchTerm).toBe("Atlas");
    expect(reloadedStore.getState().isDrawerOpen).toBe(true);
  });
});
