import React, { useState } from "react";
import CompaniesTable from "./CompaniesTable";
import CompanyModal from "./CompanyModal";
import { Company, CompanyForm } from "./types";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: "c1",
      name: "Marshall Holdings",
      industry: "Finance",
      website: "https://marshall.com",
      phone: "555-441-2200",
      address: "100 King St W, Toronto",
      tags: ["Enterprise", "Top Client"],
      createdAt: new Date().toISOString(),
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);

  const save = (data: CompanyForm) => {
    if (editing) {
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === editing.id ? { ...c, ...data, id: c.id } : c
        )
      );
    } else {
      setCompanies((prev) => [
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
        <h1 className="text-xl font-semibold">Companies</h1>

        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="rounded bg-emerald-600 text-white px-4 py-2 text-sm"
        >
          New Company
        </button>
      </div>

      <CompaniesTable
        companies={companies}
        onEdit={(c) => {
          setEditing(c);
          setModalOpen(true);
        }}
      />

      <CompanyModal
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
