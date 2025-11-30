import React, { useState } from 'react';
import { useDocumentStore } from '../../state/documentStore';

export default function DocumentUploadModal({ docId, onClose }: any) {
  const upload = useDocumentStore((s) => s.uploadNewVersion);
  const refresh = useDocumentStore((s) => s.refresh);
  const [file, setFile] = useState<File | null>(null);

  async function submit() {
    if (!file) return;
    await upload(docId, file);
    await refresh(docId);
    onClose();
  }

  return (
    <div className="modal">
      <div className="modal-box">
        <h3>Upload New Version</h3>

        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button onClick={submit}>Upload</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
