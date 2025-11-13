// src/layouts/AppLayout.tsx
// Thin wrapper around StaffLayout to keep a single source of truth
// for the main authenticated shell.

import React from "react";
import StaffLayout from "./StaffLayout";

const AppLayout: React.FC = () => {
  return <StaffLayout />;
};

export default AppLayout;
