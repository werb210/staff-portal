import React from 'react';
import { useLenderAdminStore } from '../../state/lenderAdminStore';

export default function LenderList() {
  const { lenders, setEditing, toggleActive } = useLenderAdminStore();

  return (
    <div>
      <h2>Existing Lender Products</h2>

      {lenders.length === 0 && <div>No lenders configured yet.</div>}

      {lenders.map((lender) => (
        <div
          key={lender.id}
          style={{
            padding: '10px',
            marginBottom: '8px',
            background: 'white',
            borderRadius: 6,
            borderLeft: lender.active ? '4px solid #4caf50' : '4px solid #999',
            cursor: 'pointer',
          }}
          onClick={() => setEditing(lender)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <strong>{lender.lenderName}</strong>
              <div style={{ fontSize: 13, color: '#555' }}>
                {lender.productCategory} — ${lender.amountRange.min.toLocaleString()} to $
                {lender.amountRange.max.toLocaleString()}
              </div>
              {lender.creditRequirements && (
                <div style={{ fontSize: 12, color: '#777' }}>
                  Credit: {lender.creditRequirements}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: 12,
                  color: lender.active ? '#4caf50' : '#999',
                  marginBottom: 6,
                }}
              >
                {lender.active ? 'ACTIVE' : 'INACTIVE'}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleActive(lender.id);
                }}
              >
                {lender.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
