import { FC } from 'react';
import { useApiData } from '../hooks/useApiData';
import '../styles/layout.css';

type Lender = {
  name: string;
  contact: string;
  programs: number;
};

type LendersResponse = {
  lenders: Lender[];
};

const Lenders: FC = () => {
  const { data, loading, error } = useApiData<LendersResponse>('/lenders', {
    lenders: [],
  });

  return (
    <section className="page-card">
      <h2>Lenders</h2>
      <p>Maintain visibility into available lending partners.</p>
      {loading && <p>Loading lenders…</p>}
      {error && <p role="alert">Failed to load lenders: {error}</p>}
      {!loading && data && (
        <ul>
          {data.lenders.length === 0 && <li>No lenders connected.</li>}
          {data.lenders.map((lender) => (
            <li key={lender.name}>
              <strong>{lender.name}</strong> — {lender.contact} ({lender.programs} programs)
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Lenders;
