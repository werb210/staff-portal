import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Dashboard" },
  { to: "/users", label: "Users" },
  { to: "/applications", label: "Applications" },
  { to: "/ocr", label: "OCR" },
  { to: "/tags", label: "Tags" },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
      <div className="p-4 font-bold text-xl">Staff Portal</div>

      <nav className="flex-1 space-y-1 px-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm ${
                isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
