import React from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import TopBarSearch from "./TopBarSearch";

export default function NavBar() {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white shadow">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-indigo-600 px-3 py-1 text-sm font-bold text-white">
          BF
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-900">
            Boreal Staff Portal
          </div>
          <div className="text-xs text-slate-500">Operations console</div>
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <TopBarSearch />
      </div>

      <div className="flex items-center gap-3">
        <ThemeSwitcher />

        <button
          className="relative rounded-full border border-slate-300 bg-white p-2 shadow-sm hover:bg-slate-100"
          aria-label="notifications"
        >
          <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            3
          </span>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5 text-slate-700"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.657A2 2 0 0113 19H11a2 2 0 01-1.857-1.343M19 10c0 3.866-3.134 7-7 7s-7-3.134-7-7a7 7 0 1114 0z"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
