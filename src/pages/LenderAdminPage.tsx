import React, { useEffect } from 'react';
import { useLenderAdminStore } from '../state/lenderAdminStore';
import LenderList from '../components/lenders/LenderList';
import LenderForm from '../components/lenders/LenderForm';

export default function LenderAdminPage() {
  const { load, loading, editing, setEditing } = useLenderAdminStore();

  useEffect(() => {
    load();
  }, [load]);

  function onCreateNew() {
    setEditing({
      id: '',
      lenderName: '',
      productCategory: '',
      amountRange: { min: 0, max: 0 },
      creditRequirements: '',
      requiredDocs: [],
      disqualifiers: {},
      active: true,
    });
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Lender Product Admin</h1>

      <p style={{ maxWidth: 600 }}>
        Manage lender products, amount ranges, credit requirements, required
        docs, and disqualifiers used by the matching engine.
      </p>

      <div style={{ margin: '20px 0' }}>
        <button onClick={onCreateNew}>Add New Lender Product</button>
      </div>

      {loading && <div>Loading lenders…</div>}

      {!loading && (
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: 2 }}>
            <LenderList />
          </div>
          <div style={{ flex: 3 }}>
            {editing ? (
              <LenderForm />
            ) : (
              <div style={{ padding: '10px', background: '#fafafa', borderRadius: 6 }}>
                Select a lender product to edit or click “Add New Lender Product”.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
