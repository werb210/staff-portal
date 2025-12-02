import React, { useState } from "react";
import ProductsTable from "./ProductsTable";
import ProductModal from "./ProductModal";
import { Product, ProductForm } from "./types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "p1",
      name: "Term Loan",
      category: "Debt",
      description: "Fixed-term funding solution",
      minAmount: 5000,
      maxAmount: 500000,
      tags: ["Loan", "Primary"],
      createdAt: new Date().toISOString(),
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const save = (data: ProductForm) => {
    if (editing) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editing.id ? { ...p, ...data, id: p.id } : p
        )
      );
    } else {
      setProducts((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          createdAt: new Date().toISOString(),
          ...data,
        },
      ]);
    }

    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">Products</h1>

        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="rounded bg-emerald-600 text-white px-4 py-2 text-sm"
        >
          New Product
        </button>
      </div>

      <ProductsTable
        products={products}
        onEdit={(p) => {
          setEditing(p);
          setModalOpen(true);
        }}
      />

      <ProductModal
        open={modalOpen}
        initial={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={save}
      />
    </div>
  );
}
