import React, { useState } from 'react';
import { useDocumentStore } from '../../state/documentStore';
import DocumentItem from './DocumentItem';
import DocumentPreviewModal from './DocumentPreviewModal';
import DocumentUploadModal from './DocumentUploadModal';
import VersionHistoryModal from './VersionHistoryModal';

export default function DocumentList() {
  const docs = useDocumentStore((s) => s.docs);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [versionsId, setVersionsId] = useState<string | null>(null);

  return (
    <div>
      {docs.map((doc) => (
        <DocumentItem
          key={doc.id}
          doc={doc}
          onPreview={() => setPreviewId(doc.id)}
          onUpload={() => setUploadId(doc.id)}
          onVersions={() => setVersionsId(doc.id)}
        />
      ))}

      {previewId && <DocumentPreviewModal docId={previewId} onClose={() => setPreviewId(null)} />}
      {uploadId && <DocumentUploadModal docId={uploadId} onClose={() => setUploadId(null)} />}
      {versionsId && <VersionHistoryModal docId={versionsId} onClose={() => setVersionsId(null)} />}
    </div>
  );
}
