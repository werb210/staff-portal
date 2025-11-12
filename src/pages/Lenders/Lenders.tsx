import { useState } from 'react';
import { useLenders, useLenderProducts, useSendToLender } from '../../hooks/api/useLenders';

export default function Lenders() {
  const { data: lenders, isLoading } = useLenders();
  const { data: products } = useLenderProducts();
  const sendToLender = useSendToLender();
  const [selectedApp, setSelectedApp] = useState('');

  if (isLoading) return <div className="card loading-state">Loading lenders...</div>;

  return (
    <div className="page lenders">
      <section className="card">
        <header className="card__header">
          <h2>Lender Directory</h2>
          <span>Send applications to partner lenders</span>
        </header>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Country</th>
              <th>Specialties</th>
            </tr>
          </thead>
          <tbody>
            {lenders?.map((lender) => (
              <tr key={lender.id}>
                <td>{lender.name}</td>
                <td>{lender.country}</td>
                <td>{lender.specialties?.join(', ') ?? '—'}</td>
              </tr>
            ))}
            {lenders?.length === 0 && (
              <tr>
                <td colSpan={3}>No lenders available for this silo.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="card">
        <header className="card__header">
          <h2>Lender Products</h2>
        </header>
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Lender</th>
              <th>Rate</th>
              <th>Range</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{lenders?.find((l) => l.id === product.lenderId)?.name}</td>
                <td>{product.rate}</td>
                <td>${product.minAmount.toLocaleString()} - ${product.maxAmount.toLocaleString()}</td>
              </tr>
            ))}
            {products?.length === 0 && (
              <tr>
                <td colSpan={4}>No products configured.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="card">
        <header className="card__header">
          <h2>Send Application to Lender</h2>
        </header>
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            sendToLender.mutate({
              applicationId: selectedApp,
              lenderId: String(formData.get('lenderId')),
              notes: String(formData.get('notes') ?? ''),
            });
            event.currentTarget.reset();
            setSelectedApp('');
          }}
        >
          <label>
            Application ID
            <input value={selectedApp} onChange={(event) => setSelectedApp(event.target.value)} required />
          </label>
          <label>
            Lender
            <select name="lenderId" required>
              <option value="">Select lender</option>
              {lenders?.map((lender) => (
                <option key={lender.id} value={lender.id}>
                  {lender.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Notes
            <textarea name="notes" rows={3} placeholder="Additional context" />
          </label>
          <button type="submit" className="btn primary" disabled={sendToLender.isPending}>
            {sendToLender.isPending ? 'Sending...' : 'Send to Lender'}
          </button>
        </form>
      </section>
    </div>
  );
}
