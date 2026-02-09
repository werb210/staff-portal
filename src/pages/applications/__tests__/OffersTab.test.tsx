import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MockedFunction } from "vitest";
import { renderWithProviders } from "@/test/testUtils";
import OffersTab from "@/pages/applications/drawer/OffersTab";
import OfferComparisonTable from "@/pages/applications/drawer/OfferComparisonTable";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { fetchPortalApplication } from "@/api/applications";
import { fetchOffers, uploadOffer, type OfferRecord } from "@/api/offers";

vi.mock("@/api/offers", () => ({
  fetchOffers: vi.fn(),
  uploadOffer: vi.fn()
}));

vi.mock("@/api/applications", () => ({
  fetchPortalApplication: vi.fn()
}));

const mockOffer: OfferRecord = {
  id: "offer-1",
  lenderName: "North Bank",
  amount: 250000,
  rate: 5.5,
  term: "36 months",
  fees: "$1,000",
  uploadedAt: "2024-02-01T12:00:00.000Z",
  fileName: "north-bank.pdf"
};

describe("OffersTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useApplicationDrawerStore.setState({ selectedApplicationId: "app-1", selectedTab: "offers", isOpen: true });
    (fetchOffers as MockedFunction<typeof fetchOffers>).mockResolvedValue([]);
    (fetchPortalApplication as MockedFunction<typeof fetchPortalApplication>).mockResolvedValue({
      id: "app-1",
      current_stage: "LENDERS_SENT"
    });
  });

  it("disables upload before lenders sent stage", async () => {
    (fetchPortalApplication as MockedFunction<typeof fetchPortalApplication>).mockResolvedValue({
      id: "app-1",
      current_stage: "IN_REVIEW"
    });

    renderWithProviders(<OffersTab />, { auth: { user: { id: "1", email: "staff@test.com", role: "Staff" } } });

    const button = await screen.findByRole("button", { name: "Upload term sheet" });
    expect(button).toBeDisabled();
    expect(screen.getByText(/Uploads unlock after/i)).toBeInTheDocument();
  });

  it("hides upload for non-staff roles", async () => {
    renderWithProviders(<OffersTab />, { auth: { user: { id: "2", email: "viewer@test.com", role: "Viewer" } } });

    expect(await screen.findByText(/available to staff members/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Upload term sheet" })).not.toBeInTheDocument();
  });

  it("refreshes offers after upload", async () => {
    const fetchOffersMock = fetchOffers as MockedFunction<typeof fetchOffers>;
    fetchOffersMock.mockResolvedValueOnce([]);
    fetchOffersMock.mockResolvedValueOnce([mockOffer]);
    (uploadOffer as MockedFunction<typeof uploadOffer>).mockResolvedValue({});

    const { container } = renderWithProviders(<OffersTab />, {
      auth: { user: { id: "1", email: "staff@test.com", role: "Staff" } }
    });

    await screen.findByText(/Upload term sheet/i);
    const input = container.querySelector<HTMLInputElement>("input[type='file']");
    expect(input).not.toBeNull();
    const file = new File(["pdf"], "term-sheet.pdf", { type: "application/pdf" });

    await userEvent.upload(input as HTMLInputElement, file);

    await waitFor(() => {
      expect(uploadOffer).toHaveBeenCalledWith("app-1", file);
      expect(fetchOffersMock).toHaveBeenCalledTimes(2);
    });
  });
});

describe("OfferComparisonTable", () => {
  it("renders empty state", () => {
    renderWithProviders(<OfferComparisonTable offers={[]} />);
    expect(screen.getByText(/No offers to compare yet/i)).toBeInTheDocument();
  });

  it("renders multiple offers and matches snapshot", () => {
    const { container } = renderWithProviders(
      <OfferComparisonTable offers={[mockOffer, { ...mockOffer, id: "offer-2" }]} />
    );
    expect(screen.getAllByText("North Bank")).toHaveLength(2);
    expect(container).toMatchSnapshot();
  });
});
