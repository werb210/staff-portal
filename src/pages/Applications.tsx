import { FC } from 'react';
import { useApiData } from '../hooks/useApiData';
import '../styles/layout.css';

type Application = {
  applicant: string;
  status: string;
};

type ApplicationsResponse = {
  applications: Application[];
};

const Applications: FC = () => {
  const { data, loading, error } = useApiData<ApplicationsResponse>('/applications', {
    applications: [],
  });

  return (
    <section className="page-card">
      <h2>Applications</h2>
      <p>Track and manage borrower applications.</p>
      {loading && <p>Loading applications…</p>}
      {error && <p role="alert">Failed to load applications: {error}</p>}
      {!loading && data && (
        <ul>
          {data.applications.length === 0 && <li>No applications available.</li>}
          {data.applications.map((application) => (
            <li key={application.applicant}>
              <strong>{application.applicant}</strong> — {application.status}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Applications;
