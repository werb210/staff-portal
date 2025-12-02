import { usePipelineDetailStore } from "@/state/pipelineDetailStore";
import clsx from "clsx";

type OcrEntry = {
  field: string;
  value: string;
  documentId: string | number;
};

type GroupedEntries = Record<string, { value: string; documentId: string | number }[]>;

const CATEGORIES: Record<string, string[]> = {
  "Balance Sheet Data": ["Total Assets", "Total Liabilities", "Equity", "Retained Earnings"],
  "Income Statement": ["Revenue", "COGS", "Gross Profit", "Net Income"],
  "Cash Flow Statements": ["Operating Cash Flow", "Investing Cash Flow", "Financing Cash Flow"],
  Taxes: ["GST Number", "Federal Tax ID", "Provincial Tax ID"],
  Contracts: ["Contract Start Date", "Contract End Date", "Contract Value"],
  Invoices: ["Invoice Number", "Invoice Total", "Invoice Date"],
};

const ALWAYS_SCAN = ["SIN", "Website URL", "Phone", "Email", "Business Number"];

export default function TabOCRInsights() {
  const { ocrResults } = usePipelineDetailStore();
  const ocr = ocrResults as OcrEntry[] | null;

  if (!ocr || ocr.length === 0) {
    return <div className="text-gray-700">No OCR data found.</div>;
  }

  const grouped = groupOCRByCategory(ocr);

  return (
    <div className="space-y-8">
      {Object.entries(CATEGORIES).map(([categoryName, fields]) => (
        <CategoryBlock key={categoryName} title={categoryName} fields={fields} grouped={grouped} />
      ))}

      <CategoryBlock title="Items Required" fields={ALWAYS_SCAN} grouped={grouped} />
    </div>
  );
}

function groupOCRByCategory(ocrList: OcrEntry[]): GroupedEntries {
  return ocrList.reduce<GroupedEntries>((acc, entry) => {
    const { field, value, documentId } = entry;

    if (!acc[field]) {
      acc[field] = [];
    }

    acc[field].push({ value, documentId });
    return acc;
  }, {});
}

type CategoryBlockProps = {
  title: string;
  fields: string[];
  grouped: GroupedEntries;
};

function CategoryBlock({ title, fields, grouped }: CategoryBlockProps) {
  return (
    <div className="border p-4 rounded-md bg-white shadow">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="border-b p-2">Field</th>
            <th className="border-b p-2">Values</th>
          </tr>
        </thead>

        <tbody>
          {fields.map((field) => (
            <FieldRow key={field} field={field} entries={grouped[field] || []} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

type FieldRowProps = {
  field: string;
  entries: { value: string; documentId: string | number }[];
};

function FieldRow({ field, entries }: FieldRowProps) {
  if (!entries.length) {
    return (
      <tr>
        <td className="p-2 border-b text-gray-600">{field}</td>
        <td className="p-2 border-b text-gray-400 italic">—</td>
      </tr>
    );
  }

  const uniqueValues = [...new Set(entries.map((e) => e.value))];
  const conflict = uniqueValues.length > 1;

  return (
    <tr className={clsx(conflict && "bg-red-100")}>
      <td className="p-2 border-b font-medium">{field}</td>
      <td className="p-2 border-b">
        <ul className="space-y-1">
          {entries.map((entry, index) => (
            <li key={`${entry.documentId}-${index}`}>
              <span className="font-semibold">{entry.value}</span>
              <span className="text-gray-500 text-sm"> (doc {entry.documentId})</span>
            </li>
          ))}
        </ul>
      </td>
    </tr>
  );
}
