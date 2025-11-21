import { useState } from "react";
import { useUploadDocument } from "../../hooks/useDocuments";

export default function DocumentUploadBox({ applicationId }: { applicationId: string }) {
  const upload = useUploadDocument(applicationId);

  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");

  function handleUpload() {
    if (!file || !category) return;
    upload.mutate({ file, category });
  }

  return (
    <div className="p-4 border rounded bg-white space-y-3">
      <h2 className="text-lg font-semibold">Upload Document</h2>

      <select
        className="border p-2 w-full"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Select category</option>
        <option value="bank_statement">Bank Statement</option>
        <option value="financials">Financials</option>
        <option value="id">Government ID</option>
        <option value="void_cheque">Void Cheque</option>
      </select>

      <input
        type="file"
        className="block w-full"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-600 text-white rounded"
        disabled={upload.isLoading}
      >
        {upload.isLoading ? "Uploading…" : "Upload"}
      </button>
    </div>
  );
}
