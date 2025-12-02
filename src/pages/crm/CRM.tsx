import { useState } from "react";
import ContactsTable from "../../components/ContactsTable";
import CompaniesTable from "../../components/CompaniesTable";
import DealsTable from "../../components/DealsTable";
import PipelineBoard from "../../components/pipeline/PipelineBoard";

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
    <div className="p-4">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">CRM</h1>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map((tab) => {
          const isActive = tab.label === activeTab;
          return (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`px-4 py-2 rounded border transition ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-slate-100 text-slate-900 border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div>{current.content}</div>
    </div>
  );
}
