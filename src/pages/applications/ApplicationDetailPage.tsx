import { useParams } from "react-router-dom";
import {
  useApplicationDetail,
  useApplicationDocuments,
  useApplicationBanking,
  useApplicationFinancials,
  useApplicationOCR,
  useApplicationLenders
} from "@/features/applications/hooks/useApplicationDetail";
import { useState } from "react";

const tabs = ["Overview", "Documents", "Banking", "Financials", "OCR", "Lenders"];

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [tab, setTab] = useState("Overview");

  const detail = useApplicationDetail(id!);
  const docs = useApplicationDocuments(id!);
  const banking = useApplicationBanking(id!);
  const financials = useApplicationFinancials(id!);
  const ocr = useApplicationOCR(id!);
  const lenders = useApplicationLenders(id!);

  if (detail.isLoading) return <p className="p-4">Loading application…</p>;
  if (!detail.data) return <p className="p-4 text-red-600">Application not found.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Application #{detail.data.id} — {detail.data.businessName}
      </h1>

      <div className="flex gap-4 mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded ${
              tab === t ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && <pre>{JSON.stringify(detail.data, null, 2)}</pre>}
      {tab === "Documents" && <pre>{JSON.stringify(docs.data, null, 2)}</pre>}
      {tab === "Banking" && <pre>{JSON.stringify(banking.data, null, 2)}</pre>}
      {tab === "Financials" && <pre>{JSON.stringify(financials.data, null, 2)}</pre>}
      {tab === "OCR" && <pre>{JSON.stringify(ocr.data, null, 2)}</pre>}
      {tab === "Lenders" && <pre>{JSON.stringify(lenders.data, null, 2)}</pre>}
    </div>
  );
}
