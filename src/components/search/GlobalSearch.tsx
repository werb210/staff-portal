import { useEffect, useRef } from "react";
import { useSearchStore } from "../../state/searchStore";

export default function GlobalSearch() {
  const open = useSearchStore((s) => s.open);
  const setOpen = useSearchStore((s) => s.setOpen);
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  const loading = useSearchStore((s) => s.loading);
  const results = useSearchStore((s) => s.results);
  const search = useSearchStore((s) => s.search);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    const t = setTimeout(() => search(query), 180);
    return () => clearTimeout(t);
  }, [query]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 50,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "540px",
          background: "#fff",
          borderRadius: 8,
          padding: 20,
          zIndex: 60,
          boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
        }}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search contacts, companies, deals, apps…"
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 6,
            border: "1px solid #ddd",
            fontSize: 15,
            marginBottom: 10,
          }}
        />

        {loading && <div style={{ padding: 10 }}>Searching…</div>}

        {!loading && results.length === 0 && query.length > 1 && (
          <div style={{ padding: 10 }}>No results found</div>
        )}

        {!loading &&
          results.map((r) => (
            <div
              key={r.id}
              style={{
                padding: "10px 12px",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
              }}
              onClick={() => {
                window.location.href = `/detail/${r.type}/${r.id}`;
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {r.type.toUpperCase()} — {r.id}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                {JSON.stringify(r).slice(0, 90)}…
              </div>
            </div>
          ))}
      </div>
    </>
  );
}
