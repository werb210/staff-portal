import React, { useState, useEffect } from 'react';
import { useLenderAdminStore, LenderProduct } from '../../state/lenderAdminStore';

export default function LenderForm() {
  const { editing, setEditing, create, update } = useLenderAdminStore();

  const [local, setLocal] = useState<LenderProduct | null>(editing);

  useEffect(() => {
    setLocal(editing);
  }, [editing]);

  if (!local) return null;

  function updateField<K extends keyof LenderProduct>(key: K, value: LenderProduct[K]) {
    setLocal((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!local) return;

    const payload = {
      lenderName: local.lenderName.trim(),
      productCategory: local.productCategory.trim(),
      amountRange: {
        min: Number(local.amountRange.min) || 0,
        max: Number(local.amountRange.max) || 0,
      },
      creditRequirements: local.creditRequirements || null,
      requiredDocs: local.requiredDocs,
      disqualifiers: local.disqualifiers,
      active: local.active,
    };

    if (!payload.lenderName || !payload.productCategory) {
      alert('Lender name and product category are required.');
      return;
    }

    if (local.id) {
      await update(local.id, payload);
    } else {
      await create(payload);
    }

    setEditing(null);
  }

  // helper for JSON text fields
  function parseJsonInput(raw: string, fallback: any) {
    try {
      if (!raw.trim()) return fallback;
      return JSON.parse(raw);
    } catch {
      alert('Invalid JSON. Please fix the format.');
      return fallback;
    }
  }

  const requiredDocsText = JSON.stringify(local.requiredDocs || [], null, 2);
  const disqualifiersText = JSON.stringify(local.disqualifiers || {}, null, 2);

  return (
    <form
      onSubmit={onSubmit}
      style={{
        padding: '16px',
        background: 'white',
        borderRadius: 6,
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
      }}
    >
      <h2>{local.id ? 'Edit Lender Product' : 'New Lender Product'}</h2>

      <div style={{ marginTop: 12 }}>
        <label>
          Lender Name
          <input
            type="text"
            value={local.lenderName}
            onChange={(e) => updateField('lenderName', e.target.value)}
          />
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>
          Product Category
          <input
            type="text"
            placeholder="e.g. LOC, Term Loan, Factoring"
            value={local.productCategory}
            onChange={(e) => updateField('productCategory', e.target.value)}
          />
        </label>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
        <label style={{ flex: 1 }}>
          Min Amount
          <input
            type="number"
            value={local.amountRange.min}
            onChange={(e) =>
              updateField('amountRange', {
                ...local.amountRange,
                min: Number(e.target.value),
              })
            }
          />
        </label>
        <label style={{ flex: 1 }}>
          Max Amount
          <input
            type="number"
            value={local.amountRange.max}
            onChange={(e) =>
              updateField('amountRange', {
                ...local.amountRange,
                max: Number(e.target.value),
              })
            }
          />
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>
          Credit Requirements
          <input
            type="text"
            placeholder='e.g. "600+" or "No minimum"'
            value={local.creditRequirements || ''}
            onChange={(e) => updateField('creditRequirements', e.target.value)}
          />
        </label>
      </div>

      <div style={{ marginTop: 16 }}>
        <label>
          Required Documents (JSON Array)
          <textarea
            style={{ width: '100%', height: 100, fontFamily: 'monospace' }}
            value={requiredDocsText}
            onChange={(e) => {
              const parsed = parseJsonInput(e.target.value, local.requiredDocs || []);
              updateField('requiredDocs', parsed);
            }}
          />
        </label>
        <div style={{ fontSize: 12, color: '#666' }}>
          Example:{' '}
          <code>["Bank Statements", "Voided Cheque", "Driver License"]</code>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label>
          Disqualifiers (JSON Object)
          <textarea
            style={{ width: '100%', height: 120, fontFamily: 'monospace' }}
            value={disqualifiersText}
            onChange={(e) => {
              const parsed = parseJsonInput(e.target.value, local.disqualifiers || {});
              updateField('disqualifiers', parsed);
            }}
          />
        </label>
        <div style={{ fontSize: 12, color: '#666' }}>
          Keys should match OCR/Banking fields, e.g:
          <br />
          <code>
            {'{ "riskFlags.frequentNSF": true, "monthlyRevenue.avg": {"lt": 10000} }'}
          </code>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>
          <input
            type="checkbox"
            checked={local.active}
            onChange={(e) => updateField('active', e.target.checked)}
          />{' '}
          Active
        </label>
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        <button type="submit">
          {local.id ? 'Save Changes' : 'Create Lender Product'}
        </button>
        <button
          type="button"
          onClick={() => setEditing(null)}
          style={{ background: '#ddd' }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
