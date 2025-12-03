import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import ContactsTable from "../components/ContactsTable";
import CompaniesTable from "../components/CompaniesTable";
import DealsTable from "../components/DealsTable";
import PipelineBoard from "../components/pipeline/PipelineBoard";

const tabs = [
  {
    label: "Contacts",
    content: <ContactsTable />,
  },
  {
    label: "Companies",
    content: <CompaniesTable />,
  },
  {
    label: "Deals",
    content: <DealsTable />,
  },
  {
    label: "Pipeline",
    content: <PipelineBoard />,
  },
];

export default function CRM() {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].label);

  const current = tabs.find((t) => t.label === activeTab) ?? tabs[0];

  return (
    <MainLayout>
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ margin: 0 }}>CRM</h1>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {tabs.map((tab) => {
            const isActive = tab.label === activeTab;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  background: isActive ? "#0f1823" : "#f5f5f5",
                  color: isActive ? "#fff" : "#000",
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div>{current.content}</div>
      </div>
    </MainLayout>
  );
}
