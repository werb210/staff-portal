import { usePipelineDetailStore } from "@/state/pipelineDetailStore";
import clsx from "clsx";

export default function TabOCRInsights() {
  const ocr = usePipelineDetailStore((s) => s.ocrResults);

  if (!ocr) {
    return <div className="text-gray-600">No OCR data available.</div>;
  }

  // Expected backend shape:
  // {
  //   balanceSheet: { field: value, ... }
  //   incomeStatement: { ... }
  //   cashFlow: { ... }
  //   taxes: { ... }
  //   contracts: { ... }
  //   invoices: { ... }
  //   requiredItems: { ... }  // Always scanned across all docs
  // }

  const groups = [
    { key: "balanceSheet", label: "Balance Sheet Data" },
    { key: "incomeStatement", label: "Income Statement" },
    { key: "cashFlow", label: "Cash Flow Statements" },
    { key: "taxes", label: "Tax Documents" },
    { key: "contracts", label: "Contracts" },
    { key: "invoices", label: "Invoices" },
  ];

  const highlightIfMismatch = (field: string) => {
    const values: string[] = [];

    for (const g of groups) {
      const groupData = ocr[g.key];
      if (groupData && groupData[field] !== undefined) {
        values.push(String(groupData[field]));
      }
    }

    // If multiple values exist and they don't match → mismatch
    const unique = new Set(values.map((v) => v.trim()));
    return unique.size > 1;
  };

  const renderGroup = (data: Record<string, unknown> | undefined | null) => {
    if (!data || Object.keys(data).length === 0) {
      return <div className="text-gray-600 italic">No recognized OCR fields</div>;
    }

    return (
      <div className="space-y-2">
        {Object.entries(data).map(([field, value]) => {
          const mismatch = highlightIfMismatch(field);

          return (
            <div
              key={field}
              className={clsx(
                "flex justify-between py-1 border-b border-gray-200",
                mismatch && "bg-red-100 text-red-800 font-bold"
              )}
            >
              <span className="font-medium">{field}</span>
              <span>{String(value ?? "—")}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {groups.map((g) => (
        <section key={g.key}>
          <h2 className="text-xl font-bold mb-3">{g.label}</h2>
          <div className="bg-white shadow rounded-lg p-4">
            {renderGroup(ocr[g.key])}
          </div>
        </section>
      ))}

      <section>
        <h2 className="text-xl font-bold mb-3">Items Required (All Document Types)</h2>
        <div className="bg-white shadow rounded-lg p-4">
          {renderGroup(ocr.requiredItems)}
        </div>
      </section>
    </div>
  );
}
