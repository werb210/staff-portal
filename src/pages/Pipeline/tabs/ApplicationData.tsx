import { usePipelineApplication } from '../../../hooks/usePipeline';
import { Spinner } from '../../../components/common/Spinner';

interface ApplicationDataProps {
  applicationId: string;
}

const ApplicationData = ({ applicationId }: ApplicationDataProps) => {
  const { data, isLoading } = usePipelineApplication(applicationId);

  if (isLoading) {
    return <Spinner />;
  }

  if (!data) {
    return <p>No application details found.</p>;
  }

  return (
    <div className="tab-panel">
      <h3>Applicant Information</h3>
      <dl>
        <dt>Applicant</dt>
        <dd>{data.applicant}</dd>
        <dt>Requested Amount</dt>
        <dd>${data.amount?.toLocaleString?.() ?? data.amount}</dd>
        <dt>Status</dt>
        <dd>{data.stage}</dd>
        <dt>Updated</dt>
        <dd>{data.updatedAt}</dd>
      </dl>
    </div>
  );
};

export default ApplicationData;
