import { useEffect, useState } from "react";
import { biGetCommissions } from "../../../api/biClient";

export default function CommissionReport() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setRows(await biGetCommissions());
  }

  return (
    <div>
      <h3>Commission Ledger</h3>

      {rows.map((r) => (
        <div key={r.id} className="crm-card">
          <p>Application: {r.application_id}</p>
          <p>Premium: ${r.annual_premium_amount}</p>
          <p>Commission (10%): ${r.commission_amount}</p>
          <p>Status: {r.status}</p>
        </div>
      ))}
    </div>
  );
}
