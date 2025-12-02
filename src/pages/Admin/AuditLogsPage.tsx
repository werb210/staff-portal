import AuditFilters from "../../components/audit/AuditFilters";
import AuditTable from "../../components/audit/AuditTable";

export default function AuditLogsPage() {
  return (
    <div>
      <AuditFilters />
      <AuditTable />
    </div>
  );
}
