import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DocumentGroup from '../../ocr/DocumentGroup';
import { useOcrStore } from '../../../state/ocrStore';

export default function OcrTab() {
  const { id } = useParams();
  const grouped = useOcrStore((s) => s.grouped);
  const load = useOcrStore((s) => s.load);

  useEffect(() => {
    if (id) load(id);

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (data.type === "document" || data.type === "ocr-update") {
          load(id!);
        }
      } catch (_) {}
    };
    return () => ws.close();
  }, [id, load]);

  if (!grouped || Object.keys(grouped).length === 0) {
    return <div>No OCR data available.</div>;
  }

  return (
    <div>
      <h2>OCR Insights</h2>

      <DocumentGroup title="Balance Sheet" fields={grouped.BALANCE_SHEET} />
      <DocumentGroup title="Income Statement" fields={grouped.INCOME} />
      <DocumentGroup title="Cash Flow" fields={grouped.CASHFLOW} />
      <DocumentGroup title="Taxes" fields={grouped.TAXES} />
      <DocumentGroup title="Contracts" fields={grouped.CONTRACTS} />
      <DocumentGroup title="Invoices" fields={grouped.INVOICES} />
      <DocumentGroup title="Other" fields={grouped.OTHER} />
    </div>
  );
}
