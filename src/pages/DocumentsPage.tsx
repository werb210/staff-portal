import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { PageLayout, PageSection } from "../components/layout/PageLayout";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import DocumentsList from "../modules/documents/DocumentsList";
import DocumentViewer from "../modules/documents/DocumentViewer";
import UploadDocument from "../modules/documents/UploadDocument";
import { DocumentListResponse, DocumentRecord, fetchDocuments } from "../modules/documents/documents.api";

export default function DocumentsPage() {
  const [applicationId, setApplicationId] = useState("app-001");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDocumentId(null);
  }, [applicationId]);

  const documentsQuery = useQuery({
    queryKey: ["documents", applicationId],
    queryFn: async () => (await fetchDocuments<DocumentListResponse>(applicationId)).data,
    enabled: Boolean(applicationId),
    staleTime: 30_000,
  });

  const documents = useMemo(() => {
    if (!documentsQuery.data) return [] as DocumentRecord[];
    return documentsQuery.data.documents ?? documentsQuery.data.items ?? documentsQuery.data.data ?? [];
  }, [documentsQuery.data]);

  useEffect(() => {
    if (documents.length && !selectedDocumentId) {
      setSelectedDocumentId(documents[0].id);
    }
  }, [documents, selectedDocumentId]);

  const selectedDocument = documents.find((document) => document.id === selectedDocumentId) ?? null;

  return (
    <PageLayout
      title="Documents"
      description="Full Staff App document system with OCR visibility."
      badge="Documents"
      actions={
        <div className="flex items-center gap-3">
          <div className="grid gap-1 text-sm">
            <span className="text-slate-600">Application ID</span>
            <Input value={applicationId} onChange={(event) => setApplicationId(event.target.value)} />
          </div>
          <Badge variant="outline">/api/documents/{applicationId}</Badge>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <PageSection title="Document intake" description="Upload and manage application documents.">
            <div className="space-y-4">
              <UploadDocument applicationId={applicationId} onUploaded={documentsQuery.refetch} />
              <DocumentsList
                applicationId={applicationId}
                documents={documents}
                isLoading={documentsQuery.isFetching}
                isError={documentsQuery.isError}
                onRefresh={documentsQuery.refetch}
                selectedDocumentId={selectedDocumentId}
                onSelect={(document) => setSelectedDocumentId(document.id)}
              />
            </div>
          </PageSection>
        </div>

        <div className="space-y-6 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>OCR + viewer</CardTitle>
              <CardDescription>Preview S3 documents and inspect OCR output.</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentViewer document={selectedDocument} />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
