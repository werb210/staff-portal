import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import api from "@/lib/api/client";

interface UploadBody {
  file?: File;
  category: string;
  type: string;
  applicationId: string;
}

export default function DocumentUploadPage() {
  const [form, setForm] = useState<UploadBody>({ category: "", type: "", applicationId: "" });
  const { addToast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!form.file) throw new Error("File is required");
      const presign = await api.post("/api/documents/upload-url", {
        filename: form.file.name,
        type: form.type,
      });
      await fetch(presign.data.url, {
        method: "PUT",
        body: form.file,
        headers: { "Content-Type": form.file.type },
      });
      await api.post("/api/documents", {
        category: form.category,
        type: form.type,
        applicationId: form.applicationId,
        url: presign.data.url,
      });
    },
    onSuccess: () => addToast({ title: "Document uploaded", variant: "success" }),
    onError: (err) => addToast({ title: "Upload failed", description: String(err), variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
        <p className="text-gray-600">Send new files to S3/Azure using pre-signed URLs.</p>
      </div>
      <Card className="p-4 space-y-3">
        <Input
          placeholder="Application ID"
          value={form.applicationId}
          onChange={(e) => setForm((prev) => ({ ...prev, applicationId: e.target.value }))}
        />
        <Input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
        />
        <Input
          placeholder="Type"
          value={form.type}
          onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
        />
        <Input
          type="file"
          onChange={(e) => setForm((prev) => ({ ...prev, file: e.target.files?.[0] }))}
        />
        <Button onClick={() => uploadMutation.mutate()} disabled={uploadMutation.isPending}>
          Upload
        </Button>
      </Card>
    </div>
  );
}
