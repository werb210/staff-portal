import React, { useState } from 'react';
import { useApplicationStore } from '../../state/applicationStore';
import OverviewTab from './tabs/OverviewTab';
import BankingTab from './tabs/BankingTab';
import OcrTab from './tabs/OcrTab';
import DocumentTab from './tabs/DocumentTab';
import ChatTab from './tabs/ChatTab';
import LenderTab from './tabs/LenderTab';

const TABS = [
  "Overview",
  "Banking",
  "OCR",
  "Documents",
  "Chat",
  "Lenders"
];

export default function ApplicationLayout() {
  const app = useApplicationStore((s) => s.application);
  const [tab, setTab] = useState("Overview");

  if (!app) return <div>Loading...</div>;

  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* LEFT SIDEBAR */}
      <aside style={{ width: "280px", background: "#fafafa", padding: "20px" }}>
        <h2>{app.businessName}</h2>
        <p>{app.applicantName}</p>
        <p>Requested: ${app.requestedAmount}</p>
        <p>Stage: {app.pipelineStage}</p>

        <hr />

        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {TABS.map((t) => (
            <button
              key={t}
              className={tab === t ? "active-tab" : ""}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>
      </aside>

      {/* RIGHT PANEL */}
      <main style={{ flex: 1, padding: "20px" }}>
        {tab === "Overview" && <OverviewTab />}
        {tab === "Banking" && <BankingTab />}
        {tab === "OCR" && <OcrTab />}
        {tab === "Documents" && <DocumentTab />}
        {tab === "Chat" && <ChatTab />}
        {tab === "Lenders" && <LenderTab />}
      </main>
    </div>
  );
}
