import { useState } from "react";

interface Props {
  tabs: { key: string; label: string; content: JSX.Element }[];
}

export default function ApplicationTabs({ tabs }: Props) {
  const [active, setActive] = useState(tabs[0].key);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", borderBottom: "1px solid #ddd" }}>
        {tabs.map((t) => (
          <div
            key={t.key}
            onClick={() => setActive(t.key)}
            style={{
              padding: "12px 18px",
              cursor: "pointer",
              borderBottom:
                active === t.key ? "3px solid #0078ff" : "3px solid transparent",
              fontWeight: active === t.key ? 700 : 500,
            }}
          >
            {t.label}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {tabs.find((t) => t.key === active)?.content}
      </div>
    </div>
  );
}
