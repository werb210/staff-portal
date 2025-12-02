import React, { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <button
      className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
      onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
    >
      <span className="text-lg">{theme === "light" ? "☀️" : "🌙"}</span>
      {theme === "light" ? "Light" : "Dark"}
    </button>
  );
}
