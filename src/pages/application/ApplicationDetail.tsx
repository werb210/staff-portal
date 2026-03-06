import { useState } from "react";
import { apiClient } from "@/api/httpClient";
import OfferUploader from "@/components/offers/OfferUploader";
import ChatPanel from "@/components/chat/ChatPanel";

const tabs = ["Application", "Banking Analysis", "Financials", "Documents", "Credit Summary", "Notes", "Lenders"] as const;

type TabName = (typeof tabs)[number];

type LenderMatch = {
  lender: string;
  likelihood: number;
  termSheet?: string;
};

const defaultMatches: LenderMatch[] = [
  { lender: "Lender A", likelihood: 84 },
  { lender: "Lender B", likelihood: 72 }
];

const ApplicationDetail = ({ applicationId = "app-1" }: { applicationId?: string }) => {
  const [activeTab, setActiveTab] = useState<TabName>("Application");
  const [selectedLenders, setSelectedLenders] = useState<Record<string, boolean>>({});

  const handleDocAction = async (status: "accepted" | "rejected") => {
    const reason = status === "rejected" ? window.prompt("Rejection reason") : "Accepted";
    if (!reason) return;
    await apiClient.post(`/api/applications/${applicationId}/documents/review`, { status, reason, notifyChannels: ["sms", "portal"] });
  };

  const sendSelected = async () => {
    const lenders = Object.entries(selectedLenders)
      .filter(([, selected]) => selected)
      .map(([lender]) => lender);
    await apiClient.post("/lender-submissions", { applicationId, lenders });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-auto">
        {tabs.map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Documents" ? (
        <div className="space-x-2">
          <button type="button">View</button>
          <button type="button">Download</button>
          <button type="button" onClick={() => void handleDocAction("accepted")}>Accept</button>
          <button type="button" onClick={() => void handleDocAction("rejected")}>Reject</button>
        </div>
      ) : null}

      {activeTab === "Lenders" ? (
        <div className="space-y-2">
          <table>
            <thead>
              <tr><th>Likelihood %</th><th>Lender</th><th>Send</th><th>Upload Term Sheet</th></tr>
            </thead>
            <tbody>
              {defaultMatches.map((match) => (
                <tr key={match.lender}>
                  <td>{match.likelihood}%</td>
                  <td>{match.lender}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedLenders[match.lender])}
                      onChange={(event) => setSelectedLenders((prev) => ({ ...prev, [match.lender]: event.target.checked }))}
                    />
                  </td>
                  <td><input type="file" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={() => void sendSelected()}>Send Selected</button>
        </div>
      ) : null}

      {activeTab === "Notes" ? <ChatPanel applicationId={applicationId} /> : null}
      {activeTab === "Financials" ? <OfferUploader applicationId={applicationId} /> : null}
    </div>
  );
};

export default ApplicationDetail;
