import { usePipelineDetailStore } from "@/state/pipelineDetailStore";

export default function TabFinancials() {
  const financials = usePipelineDetailStore((s) => s.financials);

  if (!financials) {
    return <div className="text-gray-600">No financial analysis available.</div>;
  }

  const Section = ({ title, children }: any) => (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      <div className="bg-white shadow rounded-lg p-4">{children}</div>
    </section>
  );

  const Row = ({
    label,
    value,
  }: {
    label: string;
    value: any;
  }) => (
    <div className="flex justify-between py-1 border-b border-gray-200">
      <span className="font-medium text-gray-700">{label}</span>
      <span className="text-gray-900">{value ?? "—"}</span>
    </div>
  );

  const renderGroup = (group: Record<string, any> | null) => {
    if (!group || Object.keys(group).length === 0) {
      return <div className="text-gray-600 italic">No data</div>;
    }

    return (
      <div className="space-y-2">
        {Object.entries(group).map(([label, value]) => (
          <Row key={label} label={label} value={value} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10">
      <Section title="Balance Sheet">
        {renderGroup(financials.balanceSheet)}
      </Section>

      <Section title="Income Statement">
        {renderGroup(financials.incomeStatement)}
      </Section>

      <Section title="Cash Flow Statement">
        {renderGroup(financials.cashFlow)}
      </Section>

      <Section title="Tax Documents">
        {renderGroup(financials.taxes)}
      </Section>

      <Section title="Contracts">
        {renderGroup(financials.contracts)}
      </Section>

      <Section title="Invoices">
        {renderGroup(financials.invoices)}
      </Section>

      <Section title="Raw OCR Extracted Fields">
        {financials.raw ? (
          <pre className="text-xs bg-gray-900 text-green-300 p-4 rounded-lg overflow-x-auto max-h-80">
            {JSON.stringify(financials.raw, null, 2)}
          </pre>
        ) : (
          <div className="text-gray-600">No raw OCR data.</div>
        )}
      </Section>
    </div>
  );
}
