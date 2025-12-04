import { useMemo, useState } from "react";
import CompaniesTable from "../components/companies/CompaniesTable";
import MainLayout from "../layout/MainLayout";

const tabs = [
  {
    id: "overview",
    label: "Overview",
    content: (
      <div className="space-y-2">
        <p className="text-gray-700">
          Welcome to the admin dashboard. Use the tabs to jump between key CRM
          datasets.
        </p>
        <p className="text-gray-600">Select a tab to get started.</p>
      </div>
    ),
  },
  {
    id: "companies",
    label: "Companies",
    content: <CompaniesTable />,
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);

  const current = useMemo(
    () => tabs.find((t) => t.id === activeTab) ?? tabs[0],
    [activeTab]
  );

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-gray-700">
            Monitor your CRM data and drill into company records.
          </p>
        </div>

        <div className="flex gap-2">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded border ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-700"
                    : "bg-white text-gray-800 border-gray-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="bg-white p-4 rounded shadow">{current.content}</div>
      </div>
    </MainLayout>
  );
}
