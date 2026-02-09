// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApplicationTab from "./ApplicationTab";
import { renderWithProviders } from "@/test/testUtils";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { fetchPortalApplication, updatePortalApplication } from "@/api/applications";

vi.mock("@/api/applications", () => ({
  fetchPortalApplication: vi.fn(),
  updatePortalApplication: vi.fn()
}));

const fetchPortalApplicationMock = vi.mocked(fetchPortalApplication);
const updatePortalApplicationMock = vi.mocked(updatePortalApplication);

describe("ApplicationTab", () => {
  beforeEach(() => {
    useApplicationDrawerStore.setState({
      isOpen: true,
      selectedApplicationId: "app-123",
      selectedTab: "application"
    });
    fetchPortalApplicationMock.mockReset();
    updatePortalApplicationMock.mockReset();
  });

  it("renders all canonical application fields", async () => {
    fetchPortalApplicationMock.mockResolvedValueOnce({
      id: "app-123",
      business: {
        legalName: "Atlas Bakery",
        operatingName: "Atlas",
        address: "101 Market St",
        structure: "LLC",
        industry: "Food",
        websiteUrl: "https://atlas.example.com"
      },
      operations: {
        startDate: "2020-01-01",
        yearsInBusiness: 4,
        productCategory: "Bakery",
        useOfFunds: "Expansion",
        requestedAmount: 50000
      },
      primaryContact: {
        name: "Taylor",
        email: "taylor@example.com",
        phone: "555-0100"
      },
      auditTimeline: []
    });

    renderWithProviders(<ApplicationTab />);

    await waitFor(() => {
      [
        "Legal name",
        "Operating name",
        "Business address",
        "Business structure",
        "Industry",
        "Website URL",
        "Start date",
        "Years in business",
        "Product category",
        "Use of funds",
        "Requested amount",
        "Contact name",
        "Contact email",
        "Contact phone"
      ].forEach((label) => {
        expect(screen.getByLabelText(label)).toBeInTheDocument();
      });
    });
  });

  it("allows edits, saves changes, refreshes data, and records audit events without changing stage", async () => {
    fetchPortalApplicationMock
      .mockResolvedValueOnce({
        id: "app-123",
        stage: "Received",
        business: {
          legalName: "Atlas Bakery",
          operatingName: "Atlas",
          address: "101 Market St",
          structure: "LLC",
          industry: "Food",
          websiteUrl: "https://atlas.example.com"
        },
        operations: {
          startDate: "2020-01-01",
          yearsInBusiness: 4,
          productCategory: "Bakery",
          useOfFunds: "Expansion",
          requestedAmount: 50000
        },
        primaryContact: {
          name: "Taylor",
          email: "taylor@example.com",
          phone: "555-0100"
        },
        auditTimeline: []
      })
      .mockResolvedValueOnce({
        id: "app-123",
        stage: "Received",
        business: {
          legalName: "Atlas Holdings",
          operatingName: "Atlas",
          address: "101 Market St",
          structure: "LLC",
          industry: "Food",
          websiteUrl: "https://atlas.example.com"
        },
        operations: {
          startDate: "2020-01-01",
          yearsInBusiness: 4,
          productCategory: "Bakery",
          useOfFunds: "Expansion",
          requestedAmount: 50000
        },
        primaryContact: {
          name: "Taylor",
          email: "taylor@example.com",
          phone: "555-0100"
        },
        auditTimeline: [
          {
            id: "audit-1",
            type: "Application updated",
            createdAt: "2024-04-01T10:00:00Z",
            actor: "Staff User"
          }
        ]
      });
    updatePortalApplicationMock.mockResolvedValueOnce({
      id: "app-123"
    });

    renderWithProviders(<ApplicationTab />);

    const legalNameInput = await screen.findByLabelText("Legal name");
    await userEvent.clear(legalNameInput);
    await userEvent.type(legalNameInput, "Atlas Holdings");

    expect(legalNameInput).toHaveValue("Atlas Holdings");

    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(updatePortalApplicationMock).toHaveBeenCalled());

    const [, payload] = updatePortalApplicationMock.mock.calls[0];
    expect(payload).toEqual({ business: { legalName: "Atlas Holdings" } });
    expect(payload).not.toHaveProperty("stage");
    expect(payload).not.toHaveProperty("current_stage");

    await waitFor(() => expect(fetchPortalApplicationMock).toHaveBeenCalledTimes(2));

    expect(await screen.findByText("Application updated")).toBeInTheDocument();
    expect(screen.getByText(/Staff User/)).toBeInTheDocument();
  });
});
