import { useState } from "react";
import ApplicationDetailsDrawer from "./ApplicationDetailsDrawer";

export default function ApplicationsPage() {
  const [inputAppId, setInputAppId] = useState("");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  function openDrawer() {
    const trimmed = inputAppId.trim();
    if (!trimmed) return;
    setSelectedAppId(trimmed);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded shadow max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900">Application Details Drawer</h1>
        <p className="text-gray-600 mt-2">
          Enter an application ID to view its documents, OCR insights, banking
          analysis, financials, and lender matches.
        </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <label className="w-full text-sm font-medium text-gray-700">
            Application ID
            <input
              value={inputAppId}
              onChange={(e) => setInputAppId(e.target.value)}
              placeholder="e.g. app_123"
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <button
            onClick={openDrawer}
            disabled={!inputAppId.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow disabled:opacity-50"
          >
            Open Drawer
          </button>
        </div>
      </div>

      {selectedAppId && (
        <ApplicationDetailsDrawer
          appId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
        />
      )}
    </div>
  );
}
