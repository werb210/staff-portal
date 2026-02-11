import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Card from "@/components/ui/Card";
import RequireRole from "@/components/auth/RequireRole";
import {
  aiQueryKeys,
  deleteKnowledgeDocument,
  getKnowledgeDocuments,
  type AiKnowledgeCategory,
  uploadKnowledgeDocument
} from "@/services/aiService";

const categories: AiKnowledgeCategory[] = ["Product", "Lender", "Underwriting", "Process"];

const formatDateTime = (iso: string | null) => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

const AiKnowledgeContent = () => {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<AiKnowledgeCategory>("Product");
  const [isActive, setIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: aiQueryKeys.knowledge,
    queryFn: getKnowledgeDocuments
  });

  const uploadMutation = useMutation({
    mutationFn: uploadKnowledgeDocument,
    onSuccess: () => {
      setSelectedFile(null);
      void queryClient.invalidateQueries({ queryKey: aiQueryKeys.knowledge });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteKnowledgeDocument,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aiQueryKeys.knowledge });
    }
  });

  const processingCount = useMemo(
    () => documents.filter((document) => document.status === "Processing").length,
    [documents]
  );

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) return;
    await uploadMutation.mutateAsync({ file: selectedFile, category, isActive });
  };

  return (
    <div className="page space-y-4">
      <Card title="AI Knowledge Admin">
        <form className="grid gap-3 md:grid-cols-4" onSubmit={(event) => void handleUpload(event)}>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="ai-file-upload">
              Upload PDF / DOCX / TXT
            </label>
            <input
              id="ai-file-upload"
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              className="block w-full rounded-md border border-slate-300 p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="ai-category-select">
              Category
            </label>
            <select
              id="ai-category-select"
              value={category}
              onChange={(event) => setCategory(event.target.value as AiKnowledgeCategory)}
              className="w-full rounded-md border border-slate-300 p-2 text-sm"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="h-4 w-4"
              />
              Active
            </label>
            <button
              type="submit"
              disabled={!selectedFile || uploadMutation.isPending}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>

        {uploadMutation.isPending && (
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-600" role="status">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            Embedding progress spinner • Processing file
          </div>
        )}
      </Card>

      <Card title="Knowledge Documents" actions={<span className="text-sm text-slate-500">Processing: {processingCount}</span>}>
        {isLoading ? <p>Loading documents...</p> : null}
        {!isLoading && documents.length === 0 ? <p>No documents indexed yet.</p> : null}
        {!isLoading && documents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="px-3 py-2">Document</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Active</th>
                  <th className="px-3 py-2">Chunks</th>
                  <th className="px-3 py-2">Last indexed</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((document) => (
                  <tr key={document.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">{document.name}</td>
                    <td className="px-3 py-2">{document.category}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          document.status === "Indexed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {document.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">{document.isActive ? "Active" : "Inactive"}</td>
                    <td className="px-3 py-2">{document.chunkCount}</td>
                    <td className="px-3 py-2">{formatDateTime(document.lastIndexedAt)}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(document.id)}
                        className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>
    </div>
  );
};

const AiKnowledgePage = () => (
  <RequireRole roles={["Admin"]}>
    <AiKnowledgeContent />
  </RequireRole>
);

export default AiKnowledgePage;
