type MayaMemory = {
  fundingAmount?: string;
  revenue?: string;
  timeInBusiness?: string;
  productType?: string;
  industry?: string;
};

type MayaMemoryPanelProps = {
  data: MayaMemory;
};

export default function MayaMemoryPanel({ data }: MayaMemoryPanelProps) {
  return (
    <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
      <div>Funding amount: {data.fundingAmount ?? "—"}</div>
      <div>Revenue: {data.revenue ?? "—"}</div>
      <div>Time in business: {data.timeInBusiness ?? "—"}</div>
      <div>Product type: {data.productType ?? "—"}</div>
      <div>Industry: {data.industry ?? "—"}</div>
    </div>
  );
}
