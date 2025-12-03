// src/pages/ProductsPage.tsx
import { useState } from "react";
import { useProducts } from "../hooks/useProducts";

export default function ProductsPage() {
  const { list, create } = useProducts();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [lenderName, setLenderName] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;

    create.mutate({
      name,
      category,
      lenderName,
    });

    setName("");
    setCategory("");
    setLenderName("");
  };

  if (list.isLoading) return <div>Loading products…</div>;
  if (list.isError) return <div>Error loading products</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Products</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 8, marginRight: 10 }}
        />
        <input
          placeholder="Category (e.g. LOC, Term Loan)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: 8, marginRight: 10 }}
        />
        <input
          placeholder="Lender name"
          value={lenderName}
          onChange={(e) => setLenderName(e.target.value)}
          style={{ padding: 8, marginRight: 10 }}
        />
        <button onClick={handleCreate} disabled={create.isPending}>
          {create.isPending ? "Saving…" : "Add Product"}
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
              Name
            </th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
              Category
            </th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
              Lender
            </th>
          </tr>
        </thead>
        <tbody>
          {list.data?.map((p: any) => (
            <tr key={p.id}>
              <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{p.name}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                {p.category || "-"}
              </td>
              <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                {p.lenderName || p.lender || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
