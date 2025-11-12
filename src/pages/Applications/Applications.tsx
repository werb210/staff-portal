import { useState } from 'react';
import {
  useApplications,
  useCompleteApplication,
  useCreateApplication,
  useSubmitApplication,
  useUploadApplicationDocument,
} from '../../hooks/api/useApplications';
import type { ApplicationPayload, DocumentUploadPayload } from '../../types/applications';
import { FormSection } from '../../components/Form/FormSection';
import { PortalButton } from '../../components/Button/PortalButton';
import { DataTable } from '../../components/Table/DataTable';
import type { ApplicationSummary } from '../../types/applications';
import { useFormNavigation } from '../../hooks/mobile/useFormNavigation';
import { BaseModal } from '../../components/Modal/BaseModal';

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
  const [activeApplication, setActiveApplication] = useState<ApplicationSummary | null>(null);
  const formNav = useFormNavigation(2);

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate(form, {
      onSuccess: () => {
        setForm(INITIAL_FORM);
        formNav.goNext();
      },
    });
  };

  const handleUpload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    uploadMutation.mutate(uploadState, {
      onSuccess: () => {
        setUploadState({ applicationId: '', documentType: '', fileUrl: '' });
        formNav.reset();
      },
    });
  };

  const tableColumns = [
    { key: 'businessName', header: 'Business' },
    { key: 'stage', header: 'Stage' },
    { key: 'status', header: 'Status' },
    {
      key: 'updatedAt',
      header: 'Updated',
      render: (app: ApplicationSummary) => new Date(app.updatedAt).toLocaleString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (app: ApplicationSummary) => (
        <div className="table__actions">
          <PortalButton type="button" onClick={() => submitMutation.mutate(app.id)} tone="primary" loading={submitMutation.isPending}>
            Submit
          </PortalButton>
          <PortalButton
            type="button"
            tone="success"
            onClick={() => completeMutation.mutate({ applicationId: app.id })}
            loading={completeMutation.isPending}
          >
            Complete
          </PortalButton>
          <PortalButton type="button" tone="ghost" onClick={() => setActiveApplication(app)}>
            Details
          </PortalButton>
        </div>
      ),
    },
  ];

  if (isLoading) return <div className="card loading-state">Loading applications...</div>;

  return (
    <div className="page applications">
      <p role="status">Step {formNav.progress.current} of {formNav.progress.total} ({formNav.progress.percentage}% complete)</p>
      <FormSection title="Create Application" description="BF & SLF silos supported">
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
                }))
              }
              required
            />
          </label>
          <label>
            Silo
            <select value={form.silo} onChange={(event) => setForm((prev) => ({ ...prev, silo: event.target.value }))}>
              <option value="BF">BF</option>
              <option value="SLF">SLF</option>
              <option value="BI">BI (coming soon)</option>
            </select>
          </label>
          <PortalButton type="submit" tone="primary" loading={createMutation.isPending}>
            {createMutation.isPending ? 'Creating…' : 'Create Application'}
          </PortalButton>
        </form>
      </FormSection>

      <FormSection title="Upload Application Document" description="Attach supporting documentation">
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
          <PortalButton type="submit" loading={uploadMutation.isPending}>
            {uploadMutation.isPending ? 'Uploading…' : 'Submit Document'}
          </PortalButton>
        </form>
      </FormSection>

      <section className="card">
        <header className="card__header">
          <h2>Application Pipeline</h2>
          <span>Track progress and actions</span>
        </header>
        <DataTable<ApplicationSummary>
          caption="Current application inventory"
          columns={tableColumns}
          data={apps ?? []}
          getRowKey={(app) => app.id}
        />
      </section>

      <BaseModal title="Application Details" isOpen={Boolean(activeApplication)} onClose={() => setActiveApplication(null)}>
        {activeApplication ? (
          <div className="modal__details">
            <p>
              <strong>Business:</strong> {activeApplication.businessName}
            </p>
            <p>
              <strong>Status:</strong> {activeApplication.status}
            </p>
            <p>
              <strong>Stage:</strong> {activeApplication.stage}
            </p>
            <p>
              <strong>Updated:</strong> {new Date(activeApplication.updatedAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <p>No application selected.</p>
        )}
      </BaseModal>
    </div>
  );
}
