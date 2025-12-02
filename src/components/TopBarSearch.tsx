import React from "react";

export default function TopBarSearch() {
  return (
    <input
      type="search"
      placeholder="Search borrowers, tasks, lenders"
      className="w-full max-w-xl rounded-full border border-slate-300 px-4 py-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  );
}
