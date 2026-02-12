import { useEffect, useState } from "react";
import api from "@/lib/api";

type KnowledgeFile = {
  id: string;
  name: string;
};

export default function AIKnowledgeBasePage() {
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    api.get("/admin/ai-documents").then((res) => {
      setFiles(res.data || []);
    });
  }, []);

  async function upload() {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    await api.post("/admin/ai-documents", formData);
    window.location.reload();
  }

  async function remove(id: string) {
    await api.delete(`/admin/ai-documents/${id}`);
    window.location.reload();
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">AI Knowledge Base</h1>

      <div className="space-y-4">
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={() => void upload()} className="bg-blue-600 text-white px-4 py-2 rounded">
          Upload Document
        </button>
      </div>

      <div className="bg-white rounded shadow">
        {files.map((entry) => (
          <div key={entry.id} className="p-3 border-t flex justify-between">
            <span>{entry.name}</span>
            <button onClick={() => void remove(entry.id)} className="text-red-500">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
