import React from "react";

export default function ThemeSwitcher() {
  return (
    <button
      className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-100"
      aria-label="theme toggle"
    >
      Theme
    </button>
  );
}
