import React from "react";
import { DocumentCard } from "./DocumentCard";

const documents = [
  {
    id: "DOC-104",
    name: "Articles of Incorporation",
    category: "Corporate",
    status: "pending" as const,
    metadata: {
      "Uploaded by": "Alex Morgan",
      "Uploaded on": "2024-10-05",
      "File size": "1.2 MB",
      Type: "PDF",
    },
    versions: [
      { version: "v1", author: "Alex Morgan", at: "2024-10-05 10:21" },
    ],
  },
  {
    id: "DOC-105",
    name: "Driver's License",
    category: "Identity",
    status: "accepted" as const,
    metadata: {
      "Uploaded by": "Jessie Hayes",
      "Uploaded on": "2024-10-01",
      "File size": "420 KB",
      Type: "JPEG",
    },
    versions: [
      { version: "v1", author: "Jessie Hayes", at: "2024-10-01 09:00", note: "Front + back" },
    ],
  },
];

export default function DocumentViewer() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Document viewer</h3>
          <p className="text-sm text-slate-600">Preview and take actions on applicant documents.</p>
        </div>
        <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">Local-only actions</div>
      </div>

      <div className="space-y-4">
        {documents.map((doc) => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>
    </div>
  );
}
