import React, { useEffect } from 'react';
import { useDocumentStore } from '../../state/documentStore';

export default function VersionHistoryModal({ docId, onClose }: any) {
  const versions = useDocumentStore((s) => s.versions);
  const loadVersions = useDocumentStore((s) => s.loadVersions);

  useEffect(() => {
    loadVersions(docId);
  }, [docId, loadVersions]);

  const list = versions[docId] || [];

  return (
    <div className="modal">
      <div className="modal-box">
        <h3>Version History</h3>

        {list.map((v: any) => (
          <div key={v.id} style={{ marginBottom: '10px' }}>
            <strong>Version {v.version}</strong>
            <div>{new Date(v.createdAt).toLocaleString()}</div>
            <button onClick={() => window.open(v.sasUrl, '_blank')}>
              View
            </button>
          </div>
        ))}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
