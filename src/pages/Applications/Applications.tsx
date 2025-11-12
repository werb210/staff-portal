import { useState } from 'react';
import {
  useApplications,
  useCompleteApplication,
  useCreateApplication,
  useSubmitApplication,
  useUploadApplicationDocument,
} from '../../hooks/api/useApplications';
import type { ApplicationPayload, DocumentUploadPayload } from '../../types/applications';

const INITIAL_FORM: ApplicationPayload = {
  businessName: '',
  contactEmail: '',
  contactPhone: '',
  amountRequested: 0,
  silo: 'BF',
};

export default function Applications() {
  const { data: apps, isLoading } = useApplications();
  const createMutation = useCreateApplication();
  const submitMutation = useSubmitApplication();
  const uploadMutation = useUploadApplicationDocument();
  const completeMutation = useCompleteApplication();
  const [form, setForm] = useState<ApplicationPayload>(INITIAL_FORM);
  const [uploadState, setUploadState] = useState<DocumentUploadPayload>({
    applicationId: '',
    documentType: '',
    fileUrl: '',
  });

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate(form);
    setForm(INITIAL_FORM);
  };

  const handleUpload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    uploadMutation.mutate(uploadState);
    setUploadState({ applicationId: '', documentType: '', fileUrl: '' });
  };

  if (isLoading) return <div className="card loading-state">Loading applications...</div>;

  return (
    <div className="page applications">
      <section className="card">
        <header className="card__header">
          <h2>Create Application</h2>
          <span>BF & SLF silos supported</span>
        </header>
        <form className="form-grid" onSubmit={handleCreate}>
          <label>
            Business Name
            <input
              value={form.businessName}
              onChange={(event) => setForm((prev) => ({ ...prev, businessName: event.target.value }))}
              required
            />
          </label>
          <label>
            Contact Email
            <input
              type="email"
              value={form.contactEmail}
              onChange={(event) => setForm((prev) => ({ ...prev, contactEmail: event.target.value }))}
              required
            />
          </label>
          <label>
            Contact Phone
            <input
              value={form.contactPhone}
              onChange={(event) => setForm((prev) => ({ ...prev, contactPhone: event.target.value }))}
              required
            />
          </label>
          <label>
            Amount Requested
            <input
              type="number"
              value={form.amountRequested}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  amountRequested: event.target.value ? Number(event.target.value) : 0,
                }))}
              required
            />
          </label>
          <label>
            Silo
            <select
              value={form.silo}
              onChange={(event) => setForm((prev) => ({ ...prev, silo: event.target.value }))}
            >
              <option value="BF">BF</option>
              <option value="SLF">SLF</option>
              <option value="BI">BI (coming soon)</option>
            </select>
          </label>
          <button type="submit" className="btn primary" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Application'}
          </button>
        </form>
      </section>

      <section className="card">
        <header className="card__header">
          <h2>Upload Application Document</h2>
        </header>
        <form className="form-grid" onSubmit={handleUpload}>
          <label>
            Application ID
            <input
              value={uploadState.applicationId}
              onChange={(event) => setUploadState((prev) => ({ ...prev, applicationId: event.target.value }))}
              required
            />
          </label>
          <label>
            Document Type
            <input
              value={uploadState.documentType}
              onChange={(event) => setUploadState((prev) => ({ ...prev, documentType: event.target.value }))}
              required
            />
          </label>
          <label>
            File URL
            <input
              value={uploadState.fileUrl}
              onChange={(event) => setUploadState((prev) => ({ ...prev, fileUrl: event.target.value }))}
              placeholder="https://"
              required
            />
          </label>
          <button type="submit" className="btn" disabled={uploadMutation.isPending}>
            {uploadMutation.isPending ? 'Uploading...' : 'Submit Document'}
          </button>
        </form>
      </section>

      <section className="card">
        <header className="card__header">
          <h2>Application Pipeline</h2>
          <span>Track progress and actions</span>
        </header>
        <table className="table">
          <thead>
            <tr>
              <th>Business</th>
              <th>Stage</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apps?.map((app) => (
              <tr key={app.id}>
                <td>{app.businessName}</td>
                <td>{app.stage}</td>
                <td>{app.status}</td>
                <td>{new Date(app.updatedAt).toLocaleString()}</td>
                <td className="table__actions">
                  <button onClick={() => submitMutation.mutate(app.id)} disabled={submitMutation.isPending}>
                    Submit
                  </button>
                  <button
                    onClick={() => completeMutation.mutate({ applicationId: app.id })}
                    disabled={completeMutation.isPending}
                  >
                    Complete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
