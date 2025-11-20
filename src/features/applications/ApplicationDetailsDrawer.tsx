import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import BankingTab from "./BankingTab";
import DocumentsTab from "./DocumentsTab";
import FinancialsTab from "./FinancialsTab";
import LendersTab from "./LendersTab";
import OcrTab from "./OcrTab";
import { getApplication } from "./ApplicationService";
import { Application } from "./ApplicationTypes";

type TabKey = "docs" | "ocr" | "banking" | "financials" | "lenders";

type ApplicationDetailsDrawerProps = {
  appId: string;
  onClose: () => void;
};

const TABS: { key: TabKey; label: string }[] = [
  { key: "docs", label: "Documents" },
  { key: "ocr", label: "OCR Insights" },
  { key: "banking", label: "Banking" },
  { key: "financials", label: "Financials" },
  { key: "lenders", label: "Lenders" },
];

function formatDate(dateString?: string): string | null {
  if (!dateString) return null;
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString();
}

export default function ApplicationDetailsDrawer({
  appId,
  onClose,
}: ApplicationDetailsDrawerProps) {
  const [tab, setTab] = useState<TabKey>("docs");

  const {
    data: application,
    isLoading,
    isError,
    error,
  } = useQuery<Application>({
    queryKey: ["application", appId],
    queryFn: () => getApplication(appId),
    enabled: Boolean(appId),
  });

  const createdLabel = formatDate(application?.createdAt);
  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "Unknown error"
    : null;

  return (
    <div className="fixed top-0 right-0 h-full w-full max-w-[520px] bg-white shadow-xl border-l p-5 overflow-y-auto z-40">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-gray-500">Application</p>
          <h2 className="text-xl font-bold text-gray-900">
            {application?.businessName ?? "Application details"}
          </h2>
          <p className="font-mono text-sm text-gray-700">ID: {appId}</p>
          {application?.applicantName && (
            <p className="text-sm text-gray-700">Applicant: {application.applicantName}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            {application?.status && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {application.status}
              </span>
            )}
            {createdLabel && <span>Created {createdLabel}</span>}
          </div>
          {isLoading && <p className="text-sm text-gray-600">Loading application…</p>}
          {errorMessage && (
            <p className="text-sm text-red-600">Failed to load: {errorMessage}</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="text-red-600 hover:text-red-700 border border-red-200 rounded px-3 py-1 text-sm font-semibold"
        >
          Close
        </button>
      </div>

      <div className="flex gap-2 border-b pb-2 mb-4 overflow-x-auto">
        {TABS.map(({ key, label }) => {
          const isActive = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-blue-700"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="pb-6 space-y-4">
        {tab === "docs" && <DocumentsTab appId={appId} />}
        {tab === "ocr" && <OcrTab appId={appId} />}
        {tab === "banking" && <BankingTab appId={appId} />}
        {tab === "financials" && <FinancialsTab appId={appId} />}
        {tab === "lenders" && <LendersTab appId={appId} />}
      </div>
    </div>
  );
}
