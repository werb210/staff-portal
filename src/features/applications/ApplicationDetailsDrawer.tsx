import { useState } from "react";
import DocumentsTab from "./DocumentsTab";
import BankingTab from "./BankingTab";
import OcrTab from "./OcrTab";
import FinancialsTab from "./FinancialsTab";
import LendersTab from "./LendersTab";

export default function ApplicationDetailsDrawer({
  appId,
  onClose,
}: {
  appId: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState("docs");

  return (
    <div className="fixed top-0 right-0 h-full w-[520px] bg-white shadow-xl border-l p-5 overflow-y-auto">
      <button onClick={onClose} className="text-red-600 mb-4 font-semibold">
        Close
      </button>

      <div className="flex gap-3 border-b pb-3 mb-4">
        <button onClick={() => setTab("docs")}>Documents</button>
        <button onClick={() => setTab("ocr")}>OCR Insights</button>
        <button onClick={() => setTab("banking")}>Banking</button>
        <button onClick={() => setTab("financials")}>Financials</button>
        <button onClick={() => setTab("lenders")}>Lenders</button>
      </div>

      {tab === "docs" && <DocumentsTab appId={appId} />}
      {tab === "ocr" && <OcrTab appId={appId} />}
      {tab === "banking" && <BankingTab appId={appId} />}
      {tab === "financials" && <FinancialsTab appId={appId} />}
      {tab === "lenders" && <LendersTab appId={appId} />}
    </div>
  );
}
