import React from 'react';
import { useApplications } from '../../hooks/api/useApplications';

export default function Applications() {
  const { data: apps, isLoading } = useApplications();
  if (isLoading) return <p>Loading applications...</p>;

  return (
    <div>
      <h1>Applications</h1>
      <table>
        <thead>
          <tr>
            <th>Business</th>
            <th>Status</th>
            <th>Stage</th>
          </tr>
        </thead>
        <tbody>
          {apps?.map((app: any) => (
            <tr key={app.id}>
              <td>{app.businessName}</td>
              <td>{app.status}</td>
              <td>{app.stage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
