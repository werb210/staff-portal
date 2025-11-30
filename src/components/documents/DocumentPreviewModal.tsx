import React, { useEffect, useState } from 'react';
import { useDocumentStore } from '../../state/documentStore';

export default function DocumentPreviewModal({ docId, onClose }: any) {
  const preview = useDocumentStore((s) => s.preview);
  const [url, setUrl] = useState('');

  useEffect(() => {
    async function run() {
      const link = await preview(docId);
      setUrl(link);
    }
    run();
  }, [docId, preview]);

  if (!url) return <div>Loading...</div>;

  return (
    <div className="modal">
      <div className="modal-box">
        <iframe src={url} style={{ width: '100%', height: '600px' }} />
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
