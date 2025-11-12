import { usePipelineLenders } from '../../../hooks/usePipeline';
import { Spinner } from '../../../components/common/Spinner';

interface LendersProps {
  applicationId: string;
}

const Lenders = ({ applicationId }: LendersProps) => {
  const { data, isLoading } = usePipelineLenders(applicationId);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="tab-panel">
      <h3>Lenders</h3>
      <ul>
        {(data ?? []).map((lender: any) => (
          <li key={lender.id}>
            {lender.name} • {lender.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lenders;
