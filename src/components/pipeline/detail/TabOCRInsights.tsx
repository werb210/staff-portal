import clsx from "clsx";
import { usePipelineDetailStore } from "@/state/pipelineDetailStore";

/**
 * HARD GROUPS — required by user spec
 */
const GROUPS = {
  balance_sheet: "Balance Sheet Data",
  income_statement: "Income Statement",
  cash_flow: "Cash Flow Statements",
  taxes: "Taxes",
  contracts: "Contracts",
  invoices: "Invoices",
};

/**
 * FIELDS THAT MUST ALWAYS BE SCANNED ("Items Required")
 * Even if documentType doesn't match.
 */
const ALWAYS_REQUIRED = [
  "SIN",
  "Website URL",
  "Business Number",
  "NAICS",
  "Incorporation Date",
  "Legal Name",
  "Trade Name",
  "Phone Number",
  "Email",
];

export default function TabOCRInsights() {
  const { ocr } = usePipelineDetailStore();

  if (!ocr || ocr.length === 0) {
    return <div className="text-gray-700">No OCR results found.</div>;
  }

  // Organize by docType groups
  const grouped = Object.entries(GROUPS).reduce((acc, [key, label]) => {
    acc[label] = ocr.filter((r) => r.documentType === key);
    return acc;
  }, {} as Record<string, { documentType: string; id: string | number; fields?: Record<string, string> }[]>);

  // Build global lookup for "Items Required"
  const globalFieldMap = buildGlobalFieldMap(ocr);

  return (
    <div className="space-y-12">
      {Object.entries(grouped).map(([groupLabel, records]) => (
        <CategoryBlock
          key={groupLabel}
          groupLabel={groupLabel}
          records={records}
          globalFieldMap={globalFieldMap}
        />
      ))}

      {/* FINAL BLOCK — ALWAYS REQUIRED FIELDS */}
      <AlwaysRequiredBlock globalFieldMap={globalFieldMap} />
    </div>
  );
}

/**
 * Build a global hashmap of:
 *   fieldLabel → [value1, value2, ...]
 */
function buildGlobalFieldMap(
  allRows: { fields?: Record<string, string | number | null> }[]
): Record<string, (string | number | null | undefined)[]> {
  const out: Record<string, (string | number | null | undefined)[]> = {};

  allRows.forEach((row) => {
    const fields = row.fields || {};
    Object.entries(fields).forEach(([label, value]) => {
      if (!out[label]) out[label] = [];
      out[label].push(value);
    });
  });

  return out;
}

function CategoryBlock({
  groupLabel,
  records,
  globalFieldMap,
}: {
  groupLabel: string;
  records: { id: string | number; fields?: Record<string, string | number | null> }[];
  globalFieldMap: Record<string, (string | number | null | undefined)[]>;
}) {
  return (
    <div className="border rounded-lg bg-white p-6 shadow">
      <h2 className="text-2xl font-semibold mb-4">{groupLabel}</h2>

      {records.length === 0 && (
        <div className="text-gray-400 italic">No documents for this category.</div>
      )}

      {records.map((doc) => (
        <DocumentBlock
          key={doc.id}
          doc={doc}
          globalFieldMap={globalFieldMap}
        />
      ))}
    </div>
  );
}

function DocumentBlock({
  doc,
  globalFieldMap,
}: {
  doc: { id: string | number; fields?: Record<string, string | number | null> };
  globalFieldMap: Record<string, (string | number | null | undefined)[]>;
}) {
  const fields = doc.fields || {};

  return (
    <div className="mt-6 border rounded p-4 bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">
        Document ID: <span className="font-mono">{doc.id}</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(fields).map(([label, value]) => {
          const isMismatch = detectMismatch(label, globalFieldMap);
          return (
            <Metric
              key={label}
              label={label}
              value={value}
              isMismatch={isMismatch}
            />
          );
        })}
      </div>
    </div>
  );
}

function detectMismatch(label: string, globalFieldMap: Record<string, (string | number | null | undefined)[]>) {
  if (!globalFieldMap[label]) return false;
  const values = globalFieldMap[label].filter((v) => v != null);

  if (values.length <= 1) return false;

  // If ANY mismatch among values → highlight
  return new Set(values.map((v) => String(v).trim())).size > 1;
}

function Metric({
  label,
  value,
  isMismatch,
}: {
  label: string;
  value: string | number | null;
  isMismatch: boolean;
}) {
  return (
    <div
      className={clsx(
        "p-3 border rounded bg-white",
        isMismatch && "bg-red-100 border-red-500"
      )}
    >
      <div className="text-sm font-semibold text-gray-700">{label}</div>
      <div className="text-gray-900 text-sm">{String(value)}</div>
      {isMismatch && (
        <div className="text-xs text-red-700 mt-1">
          Mismatch detected across documents
        </div>
      )}
    </div>
  );
}

function AlwaysRequiredBlock({
  globalFieldMap,
}: {
  globalFieldMap: Record<string, (string | number | null | undefined)[]>;
}) {
  return (
    <div className="border rounded-lg bg-white p-6 shadow">
      <h2 className="text-2xl font-semibold mb-4">Items Required (Global Scan)</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ALWAYS_REQUIRED.map((label) => {
          const values = globalFieldMap[label] || [];
          const mismatch =
            values.length > 1 &&
            new Set(values.map((v) => String(v).trim())).size > 1;

          return (
            <div
              key={label}
              className={clsx(
                "p-3 border rounded bg-white",
                mismatch && "bg-red-100 border-red-500"
              )}
            >
              <div className="text-sm font-semibold">{label}</div>
              <div className="text-gray-900 text-sm">
                {values.length ? values.join(", ") : "—"}
              </div>
              {mismatch && (
                <div className="text-xs text-red-700 mt-1">
                  Mismatch across documents
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
