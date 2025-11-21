import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptDocument,
  fetchDocument,
  fetchDocumentVersions,
  rejectDocument,
  reuploadDocument,
  type DocumentDetails,
  type DocumentSummary,
  type DocumentVersion,
} from "./DocumentService";
import { Button } from "@/components/ui/button";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

interface Props {
  documentId: string;
}

function StatusBadge({ status }: { status: DocumentSummary["status"] }) {
  const colors: Record<DocumentSummary["status"], string> = {
    accepted: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-700",
    missing: "bg-amber-100 text-amber-800",
    pending: "bg-blue-100 text-blue-700",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs capitalize ${colors[status]}`}>
      {status}
    </span>
  );
}

function ChecksumBadge({ checksum, valid }: { checksum?: string; valid?: boolean }) {
  if (!checksum) return null;
  return (
    <div
      className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-2 ${
        valid ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"
      }`}
    >
      <span>SHA256</span>
      <span className="font-mono">{checksum}</span>
    </div>
  );
}

function VersionTimeline({ versions }: { versions: DocumentVersion[] }) {
  return (
    <ol className="space-y-3">
      {versions.map((version) => (
        <li key={version.id} className="flex gap-3 items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {new Date(version.uploadedAt).toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">Checksum: {version.checksum}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function DocumentPanel({ documentId }: Props) {
  const [selectedId, setSelectedId] = useState(documentId);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState<number>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();

  const documentQuery = useQuery({
    queryKey: ["document", selectedId],
    queryFn: () => fetchDocument(selectedId),
    enabled: !!selectedId,
  });

  const versionsQuery = useQuery({
    queryKey: ["document", selectedId, "versions"],
    queryFn: () => fetchDocumentVersions(selectedId),
    enabled: !!selectedId,
  });

  const acceptMutation = useMutation({
    mutationFn: () => acceptDocument(selectedId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", selectedId] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectDocument(selectedId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", selectedId] });
    },
  });

  const reuploadMutation = useMutation({
    mutationFn: (file: File) => reuploadDocument(selectedId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["document", selectedId, "versions"] });
      setPageNumber(1);
    },
  });

  useEffect(() => {
    setSelectedId(documentId);
  }, [documentId]);

  const documentData = documentQuery.data;
  const documents: DocumentSummary[] = useMemo(() => {
    if (!documentData) return [];
    if (documentData.documents && documentData.documents.length > 0) {
      return documentData.documents;
    }
    return [documentData];
  }, [documentData]);

  const activeDocument = documentData;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function triggerReupload() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      reuploadMutation.mutate(file);
    }
  }

  if (documentQuery.isLoading || !activeDocument) {
    return <div className="p-6">Loading documents…</div>;
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-3 bg-white border rounded-lg shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Documents</h2>
          <ChecksumBadge checksum={activeDocument.checksum} valid={activeDocument.checksumValid} />
        </div>
        <div className="space-y-2">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedId(doc.id)}
              className={`w-full text-left p-3 rounded border transition-colors ${
                doc.id === selectedId
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{doc.name}</span>
                <StatusBadge status={doc.status} />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Updated {doc.updatedAt ? new Date(doc.updatedAt).toLocaleString() : "recently"}
              </p>
            </button>
          ))}
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold mb-2">Version History</h3>
          {versionsQuery.isLoading && <p className="text-sm text-gray-600">Loading versions…</p>}
          {versionsQuery.data && versionsQuery.data.length > 0 ? (
            <VersionTimeline versions={versionsQuery.data} />
          ) : (
            <p className="text-sm text-gray-600">No previous versions.</p>
          )}
        </div>
      </div>

      <div className="col-span-9 bg-white border rounded-lg shadow-sm flex flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold">{activeDocument.name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <StatusBadge status={activeDocument.status} />
              <ChecksumBadge checksum={activeDocument.checksum} valid={activeDocument.checksumValid} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
            >
              Accept
            </Button>
            <Button
              variant="outline"
              onClick={() => rejectMutation.mutate()}
              disabled={rejectMutation.isPending}
            >
              Reject
            </Button>
            <Button onClick={triggerReupload} disabled={reuploadMutation.isPending}>
              Re-upload
            </Button>
            <input
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          <div className="bg-white shadow-sm border rounded">
            <Document
              file={activeDocument.fileUrl || (activeDocument as any).url}
              onLoadSuccess={onDocumentLoadSuccess}
            >
              <Page pageNumber={pageNumber} width={800} />
            </Document>
          </div>
          {numPages && numPages > 1 && (
            <div className="flex items-center gap-3 mt-3">
              <Button
                variant="outline"
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {pageNumber} of {numPages}
              </span>
              <Button
                variant="outline"
                disabled={pageNumber >= numPages}
                onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
