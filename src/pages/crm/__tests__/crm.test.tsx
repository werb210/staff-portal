import { afterEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactsPage from "../contacts/ContactsPage";
import CompaniesPage from "../companies/CompaniesPage";
import TimelineFeed from "../timeline/TimelineFeed";
import VoiceDialer from "@/components/dialer/VoiceDialer";
import IncomingCallToast from "@/components/dialer/IncomingCallToast";
import SMSComposer from "@/components/sms/SMSComposer";
import EmailViewer from "@/components/email/EmailViewer";
import { actAsync } from "@/test/testUtils";
import { renderWithProviders } from "@/test/renderHelpers";
import { useCrmStore } from "@/state/crm.store";
import type { Contact } from "@/api/crm";

const janeContact: Contact = {
  id: "c1",
  name: "Jane Doe",
  phone: "+1-555-111-2222",
  email: "jane@example.com",
  silo: "BF",
  owner: "Alex",
  tags: ["VIP"],
  hasActiveApplication: true,
  companyIds: ["co1"],
  applicationIds: ["app-1001"]
};

afterEach(() => {
  useCrmStore.setState({
    silo: "BF",
    filters: { search: "", owner: null, hasActiveApplication: false }
  });
});

describe("CRM Contacts", () => {
  it("renders contact list with search and filters", async () => {
    await actAsync(() => {
      renderWithProviders(<ContactsPage />);
    });
    expect(await screen.findByText("Jane Doe")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Search");
    await userEvent.type(searchInput, "Jane");
    expect(await screen.findByText("Jane Doe")).toBeInTheDocument();

    const ownerFilter = screen.getByTestId("owner-filter");
    fireEvent.change(ownerFilter, { target: { value: "Alex" } });
    expect(await screen.findByText("Jane Doe")).toBeInTheDocument();
  });

  it("opens and closes contact drawer", async () => {
    await actAsync(() => {
      renderWithProviders(<ContactsPage />);
    });
    const detailsButton = await screen.findByText("Details");
    await userEvent.click(detailsButton);
    expect(await screen.findByTestId("contact-drawer")).toBeInTheDocument();

    const closeButton = screen.getByText("Close");
    await userEvent.click(closeButton);
    await waitFor(() => expect(screen.queryByTestId("contact-drawer")).not.toBeInTheDocument());
  });

  it("mounts the calling interface", async () => {
    await actAsync(() => {
      renderWithProviders(<ContactsPage />);
    });
    const detailsButton = await screen.findByText("Details");
    await userEvent.click(detailsButton);
    const drawer = await screen.findByTestId("contact-drawer");
    const callButton = await within(drawer).findByText("Call");
    await userEvent.click(callButton);
    expect(await screen.findByTestId("voice-dialer")).toBeInTheDocument();
  });

  it("filters by silo", async () => {
    let renderResult: ReturnType<typeof renderWithProviders> | undefined;
    await actAsync(() => {
      renderResult = renderWithProviders(<ContactsPage />);
    });
    expect(await screen.findByText("Jane Doe")).toBeInTheDocument();
    useCrmStore.getState().setSilo("SLF");
    await actAsync(() => {
      renderResult?.rerender(<ContactsPage />);
    });
    await waitFor(() => expect(screen.queryByText("Jane Doe")).not.toBeInTheDocument());
  });
});

describe("CRM Companies", () => {
  it("renders companies list and drawer", async () => {
    await actAsync(() => {
      renderWithProviders(<CompaniesPage />);
    });
    expect(await screen.findByText("Boreal Finance")).toBeInTheDocument();
    const detailsButton = await screen.findByText("Details");
    await userEvent.click(detailsButton);
    expect(await screen.findByTestId("company-drawer")).toBeInTheDocument();
  });
});

describe("Communications", () => {
  it("shows incoming call toast", async () => {
    await actAsync(() => {
      render(
        <IncomingCallToast
          from="+1-555-999-0000"
          onAccept={() => undefined}
          onDismiss={() => undefined}
          onViewRecord={() => undefined}
        />
      );
    });
    expect(screen.getByTestId("incoming-call-toast")).toBeInTheDocument();
  });

  it("renders SMS thread and composer", async () => {
    await actAsync(() => {
      renderWithProviders(<SMSComposer visible contact={janeContact} onClose={() => undefined} />);
    });
    expect(await screen.findByTestId("sms-thread")).toBeInTheDocument();
  });

  it("renders email viewer", async () => {
    await actAsync(() => {
      renderWithProviders(<EmailViewer visible contactId="c1" onClose={() => undefined} />);
    });
    expect(await screen.findByTestId("email-viewer")).toBeInTheDocument();
    expect(await screen.findByTestId("email-body")).toBeInTheDocument();
  });
});

describe("Timeline", () => {
  it("merges all event types", async () => {
    await actAsync(() => {
      renderWithProviders(<TimelineFeed entityId="c1" entityType="contact" />);
    });
    const items = await screen.findAllByTestId(/timeline-/);
    expect(items.length).toBeGreaterThan(0);
    const types = [
      "Outbound call to Jane",
      "SMS from Jane",
      "Sent approval docs",
      "Internal note",
      "Document uploaded",
      "Status changed",
      "AI recommendation",
      "Lender update",
      "System action"
    ];
    for (const summary of types) {
      expect(await screen.findByText(summary)).toBeInTheDocument();
    }
  });
});

describe("Standalone Dialer", () => {
  it("requests token and shows status", async () => {
    await actAsync(() => {
      renderWithProviders(<VoiceDialer visible contact={janeContact} onClose={() => undefined} />);
    });
    expect(await screen.findByTestId("voice-dialer")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Twilio token/)).toBeInTheDocument());
  });
});
