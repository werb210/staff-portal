import { FormEvent, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { UploadDocumentInput, uploadDocument } from "./documents.api";

interface UploadDocumentProps {
  applicationId: string;
  onUploaded?: () => void;
}

export default function UploadDocument({ applicationId, onUploaded }: UploadDocumentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<string>("Bank statement");
  const [notes, setNotes] = useState<string>("");

  const mutation = useMutation({
    mutationFn: (input: UploadDocumentInput) => uploadDocument(input),
    onSuccess: () => {
      setFile(null);
      setNotes("");
      onUploaded?.();
    },
  });

  const isDisabled = useMemo(() => !applicationId || !file, [applicationId, file]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!file) return;

    mutation.mutate({ applicationId, file, type, notes });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload a document</CardTitle>
        <CardDescription>Uploads go to /api/documents/upload with multipart payloads.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="applicationId">
              Application ID
            </label>
            <Input id="applicationId" value={applicationId} disabled />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="documentType">
              Document type
            </label>
            <Input
              id="documentType"
              value={type}
              onChange={(event) => setType(event.target.value)}
              placeholder="e.g. Bank statement"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="notes">
              Notes
            </label>
            <Input
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Any flags for underwriting"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="file">
              File
            </label>
            <Input
              id="file"
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              accept="application/pdf,image/*"
            />
            {file ? (
              <p className="text-xs text-slate-500">{file.name}</p>
            ) : (
              <p className="text-xs text-slate-500">Choose a PDF or image to upload.</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            {mutation.isPending ? <span>Uploading to /api/documents/upload...</span> : null}
            {mutation.isSuccess ? <span className="text-green-700">Upload complete</span> : null}
            {mutation.isError ? <span className="text-red-700">Upload failed</span> : null}
          </div>

          <Button type="submit" disabled={isDisabled || mutation.isPending}>
            {mutation.isPending ? "Uploading..." : "Upload document"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
