import React from "react";
import ThemeSwitcher from "./ThemeSwitcher";

export default function NavBar() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-indigo-600 px-3 py-1 text-sm font-bold text-white">BSP</div>
        <div>
          <div className="text-sm font-semibold text-slate-900">Boreal Staff Portal</div>
          <div className="text-xs text-slate-500">Operations console</div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <input
          type="search"
          placeholder="Search borrowers, tasks, lenders"
          className="w-full max-w-lg rounded-full border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="flex items-center gap-3">
        <ThemeSwitcher />
        <button className="relative rounded-full border border-slate-200 bg-white p-2 shadow-sm">
          <span role="img" aria-label="bell">
            🔔
          </span>
          <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500" />
          <div>
            <div className="text-sm font-semibold text-slate-900">Alex Morgan</div>
            <div className="text-xs text-slate-500">Ops Lead</div>
          </div>
        </div>
      </div>
    </header>
  );
}
