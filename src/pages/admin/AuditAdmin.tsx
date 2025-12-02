import React from "react";

const AuditAdmin: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Audit Logs</h1>
      <p className="text-gray-700">
        Admin-only page showing system activity, log entries, and security
        events.
      </p>
    </div>
  );
};

export default AuditAdmin;
