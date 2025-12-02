import { usePipelineDetailStore } from "@/state/pipelineDetailStore";

export default function TabApplication() {
  const app = usePipelineDetailStore((s) => s.app);
  if (!app) return <div className="text-gray-600">No application data.</div>;

  // helper rendering function
  const Row = ({ label, value }: { label: string; value: any }) => (
    <div className="flex justify-between py-1 border-b border-gray-200">
      <span className="font-medium text-gray-700">{label}</span>
      <span className="text-gray-900">{value ?? "—"}</span>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* BUSINESS INFO */}
      <section>
        <h2 className="text-xl font-bold mb-3">Business Information</h2>
        <div className="bg-white shadow rounded-lg p-4 space-y-2">
          <Row label="Business Name" value={app.businessName} />
          <Row label="Operating Name" value={app.operatingName} />
          <Row label="Business Type" value={app.businessType} />
          <Row label="Industry (NAICS)" value={app.industryCode} />
          <Row label="Website" value={app.website} />
          <Row label="Phone" value={app.phone} />
          <Row label="Email" value={app.email} />
        </div>
      </section>

      {/* ADDRESS */}
      <section>
        <h2 className="text-xl font-bold mb-3">Business Address</h2>
        <div className="bg-white shadow rounded-lg p-4 space-y-2">
          <Row label="Street" value={app.addressStreet} />
          <Row label="City" value={app.addressCity} />
          <Row label="Province" value={app.addressProvince} />
          <Row label="Postal Code" value={app.addressPostal} />
        </div>
      </section>

      {/* OWNERSHIP */}
      <section>
        <h2 className="text-xl font-bold mb-3">Ownership</h2>
        <div className="bg-white shadow rounded-lg p-4 space-y-2">
          <Row label="Owner Name" value={app.ownerName} />
          <Row label="Owner Phone" value={app.ownerPhone} />
          <Row label="Owner Email" value={app.ownerEmail} />
          <Row label="Ownership %" value={app.ownershipPercent} />
          <Row label="SIN" value={app.ownerSin} />
        </div>
      </section>

      {/* FUNDING REQUIREMENTS */}
      <section>
        <h2 className="text-xl font-bold mb-3">Funding Requirements</h2>
        <div className="bg-white shadow rounded-lg p-4 space-y-2">
          <Row label="Use of Funds" value={app.useOfFunds} />
          <Row label="Loan Amount Requested" value={app.loanAmount} />
          <Row label="Term Requested" value={app.loanTerm} />
          <Row label="Preferred Product" value={app.productType} />
        </div>
      </section>

      {/* BUSINESS DETAILS */}
      <section>
        <h2 className="text-xl font-bold mb-3">Business Details</h2>
        <div className="bg-white shadow rounded-lg p-4 space-y-2">
          <Row label="Years in Business" value={app.yearsInBusiness} />
          <Row label="Monthly Revenue" value={app.monthlyRevenue} />
          <Row label="Average Bank Balance" value={app.avgBankBalance} />
          <Row label="Employees" value={app.employeeCount} />
        </div>
      </section>

      {/* ADDITIONAL QUESTIONS */}
      <section>
        <h2 className="text-xl font-bold mb-3">Additional Information</h2>
        <div className="bg-white shadow rounded-lg p-4 space-y-2">
          <Row label="Existing Loans" value={app.existingLoans} />
          <Row label="Existing Lenders" value={app.existingLenders} />
          <Row label="Tax Arrears" value={app.taxArrears} />
          <Row label="Seasonal Business" value={app.seasonal} />
        </div>
      </section>
    </div>
  );
}
