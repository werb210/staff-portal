import React from "react";

const UsersAdmin: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">User Management</h1>
      <p className="text-gray-700">
        Admin-only page for managing staff, lender, and referrer accounts.
      </p>
    </div>
  );
};

export default UsersAdmin;
